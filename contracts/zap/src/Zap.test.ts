import { MockedZap } from './MockedZap';
import { Field, Mina, PrivateKey, AccountUpdate, Signature } from 'snarkyjs';
import { KeyPair, OracleResult, Statement } from './types';
import { MockedOracle } from './utils/mockOracle';

// Speed up testing by disabling proofs for unit tests
let proofsEnabled = false;

function generateKeyPair(): KeyPair {
  const privateKey = PrivateKey.random();
  const publicKey = privateKey.toPublicKey();
  return { privateKey, publicKey };
}

async function localDeploy(
  app: MockedZap,
  appKeys: KeyPair,
  deployer: KeyPair
) {
  const tx = await Mina.transaction(deployer.publicKey, () => {
    AccountUpdate.fundNewAccount(deployer.publicKey);
    app.deploy({
      zkappKey: appKeys.privateKey,
    });
    app.setOraclePublicKey(appKeys.publicKey);
  });
  await tx.prove();
  await tx.sign([deployer.privateKey, appKeys.privateKey]).send();
}

describe('Zap', () => {
  let zap: MockedZap,
    oracle: MockedOracle,
    deployer: KeyPair,
    zapKeys: KeyPair,
    user: KeyPair;

  const metamaskSignature =
    '0x7f3943a698c1b4d732a6d24073ff2b9a68d17bd3f0a517ad3a11bc044d1b79ce5e83bfecb3a454fa189f1960bb8cb7dd53482f2b6dcf047ea8b8c3bfa65751c61b';
  const ethereumAddress = '0x768D170EE896eb95714AB43aFCaC08F970607361';

  beforeAll(async () => {
    if (proofsEnabled) await MockedZap.compile();
  });

  beforeEach(async () => {
    // create local blockchain
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    // Set up keys
    deployer = Local.testAccounts[0];
    zapKeys = generateKeyPair();
    user = Local.testAccounts[1];

    // Deploy the zap contract
    zap = new MockedZap(zapKeys.publicKey);
    await localDeploy(zap, zapKeys, deployer);

    // Create a mock oracle
    oracle = new MockedOracle(zapKeys);
  });

  it('generates and deploys the `Zap` smart contract', async () => {
    expect(zap.oraclePublicKey.get()).toEqual(zapKeys.publicKey);
  });

  describe('attestations', () => {
    it.only('emits a `statementId` event containing the statement id if the provided signature is valid (TODO add statement verification)', async () => {
      /* Statement is: 'balance of user of token with address 0xdac1..1ec7 is greater (>) than 600' */
      const statementBalanceSup: Statement = {
        route: '/balance/:0xdac17f958d2ee523a2206206994597c13d831ec7',
        args: null,
        condition: {
          type: 2,
          targetValue: 600,
        },
      };

      const oracleResult: OracleResult = await oracle.generateStatementId(
        Field(1),
        true, // will return a high result (true for holder, big balance for assets, etc.), so statement is valid
        metamaskSignature,
        ethereumAddress
      );

      const txn = await Mina.transaction(user.publicKey, () => {
        zap.verify(
          Field(statementBalanceSup.condition.type),
          Field(statementBalanceSup.condition.targetValue),
          oracleResult.data.hashRoute,
          oracleResult.data.privateData,
          oracleResult.signature ??
            fail('something is wrong with the signature'),
        );
      });
      await txn.prove();
      await txn.sign([user.privateKey]).send();

      const events = await zap.fetchEvents();
      const verifiedEventValue = events[0].event.data.toFields(null)[0];
      console.log('events', events);
      expect(events[0].type).toEqual('verified');
      // expect(verifiedEventValue).toEqual(oracleResult.data.statementId);
    });

    // it('throws an error if the statement is invalid even if the provided signature is valid', async () => {
    //   const oracleResult: OracleResult = await oracle.generateStatementId(
    //     Field(1),
    //     false, // will return a low result (true for holder, big balance, etc.), statement is invalid
    //     metamaskSignature,
    //     ethereumAddress
    //   );
    //   expect(async () => {
    //     await Mina.transaction(user.publicKey, () => {
    //       zap.verify(
    //         oracleResult.data.statementId,
    //         oracleResult.data.privateData,
    //         oracleResult.signature ??
    //           fail('something is wrong with the signature')
    //       );
    //     });
    //   }).rejects;
    // });

    // it('throws an error if the statement is valid but the provided signature is invalid', async () => {
    //   const oracleResult: OracleResult = await oracle.generateStatementId(
    //     Field(1),
    //     true, // will return a high result (true for holder, big balance, etc.)
    //     metamaskSignature,
    //     ethereumAddress
    //   );

    //   const signature = Signature.create(zapKeys.privateKey, [
    //     oracleResult.data.statementId,
    //     oracleResult.data.privateData,
    //     Field(0), // <- this is the invalid part
    //   ]);

    //   expect(async () => {
    //     await Mina.transaction(user.publicKey, () => {
    //       zap.verify(
    //         oracleResult.data.statementId,
    //         oracleResult.data.privateData,
    //         signature ?? fail('something is wrong with the signature')
    //       );
    //     });
    //   }).rejects;
    // });

    // it('throws an error if the signature of the caller is invalid', async () => {
    //   await expect(async () => {
    //     await oracle.generateStatementId(
    //       Field(1),
    //       true, // will return a high result (true for holder, big balance, etc.), statement is valid
    //       'invalid_metamask_signature',
    //       ethereumAddress
    //     );
    //   }).rejects.toThrow('signature of the caller is invalid');
    // });
  });
});
