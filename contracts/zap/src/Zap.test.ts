import { MockedZap } from './MockedZap';
import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  Signature,
  Poseidon,
} from 'snarkyjs';
import { KeyPair, OracleResult, Statement } from './types';
import { MockedOracle } from './utils/mockOracle';
import { stringToFields } from 'snarkyjs/dist/node/bindings/lib/encoding';

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

  /* Statement is: 'balance of user of token with address 0xdac1..1ec7 is greater (>) than 600' */
  const statementBalanceSup: Statement = {
    route: '/balance/:0xdac17f958d2ee523a2206206994597c13d831ec7',
    args: null,
    condition: {
      type: 2,
      targetValue: 600,
    },
  };

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
            fail('something is wrong with the signature')
        );
      });
      await txn.prove();
      await txn.sign([user.privateKey]).send();

      const expectedDataInEvent = Poseidon.hash([
        user.publicKey.toFields()[0],
        Poseidon.hash([
          oracleResult.data.hashRoute,
          oracleResult.publicKey.toFields()[0],
        ]),
      ]);

      const eventsFetched = await zap.fetchEvents();
      const dataInEventFetched = eventsFetched[0].event.data;
      expect(eventsFetched[0].type).toEqual('verified');
      expect(dataInEventFetched).toEqual(expectedDataInEvent);
    });

    it('throws an error if the statement is invalid even if the provided signature is valid', async () => {
      // oracle will return a value of 500, which is not greater than 600 => invalid statement
      const oracleResult: OracleResult = await oracle.generateStatementId(
        Field(1),
        false, // will return a low result (true for holder, big balance, etc.), leading to an invalid statement
        metamaskSignature,
        ethereumAddress
      );
      expect(async () => {
        await Mina.transaction(user.publicKey, () => {
          zap.verify(
            Field(statementBalanceSup.condition.type),
            Field(statementBalanceSup.condition.targetValue),
            oracleResult.data.hashRoute,
            oracleResult.data.privateData,
            oracleResult.signature ??
              fail('something is wrong with the signature')
          );
        });
      }).rejects;
    });

    it.only('throws an error if the statement is valid but the provided signature is invalid (wrong publicKey of oracle)', async () => {
      const oracleResult: OracleResult = await oracle.generateStatementId(
        Field(1),
        true, // will return a high result (true for holder, big balance, etc.)
        metamaskSignature,
        ethereumAddress
      );

      const invalidOracleSignature = Signature.create(zapKeys.privateKey, [
        oracleResult.data.hashRoute,
        oracleResult.data.privateData,
        Field(0), // <- this is the invalid part, we use a wrong publicKey
      ]);

      expect(async () => {
        await Mina.transaction(user.publicKey, () => {
          zap.verify(
            Field(statementBalanceSup.condition.type),
            Field(statementBalanceSup.condition.targetValue),
            oracleResult.data.hashRoute,
            oracleResult.data.privateData,
            invalidOracleSignature ?? fail('something is wrong with the signature')
          );
        });
      }).rejects;
    });

    it('throws an error if the statement is valid but the provided signature is invalid (wrong hashRoot)', async () => {
      const oracleResult: OracleResult = await oracle.generateStatementId(
        Field(1),
        true, // will return a high result (true for holder, big balance, etc.)
        metamaskSignature,
        ethereumAddress
      );

      const wrongHashRoute = Poseidon.hash([
        stringToFields('/balance/:0xdac17f958d2ee523a2206206994597c13d831ec7')[0],
      ]);

      const invalidOracleSignature = Signature.create(zapKeys.privateKey, [
        wrongHashRoute,
        oracleResult.data.privateData,
        oracleResult.publicKey.toFields()[0],        
      ]);

      expect(async () => {
        await Mina.transaction(user.publicKey, () => {
          zap.verify(
            Field(statementBalanceSup.condition.type),
            Field(statementBalanceSup.condition.targetValue),
            oracleResult.data.hashRoute,
            oracleResult.data.privateData,
            invalidOracleSignature ?? fail('something is wrong with the signature')
          );
        });
      }).rejects;
    });

    it('throws an error if the signature of the caller is invalid', async () => {
      await expect(async () => {
        await oracle.generateStatementId(
          Field(1),
          true, // will return a high result (true for holder, big balance, etc.), statement is valid
          'invalid_metamask_signature',
          ethereumAddress
        );
      }).rejects.toThrow('signature of the caller is invalid');
    });
  });
});
