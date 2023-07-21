import { MockedZap } from './MockedZap';
import { Field, Mina, PrivateKey, AccountUpdate, Signature } from 'snarkyjs';
import { KeyPair, OracleResult } from './types';
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
    it('emits a `statementId` event containing the statement id if the provided signature is valid (TODO add statement verification)', async () => {
      const oracleResult: OracleResult = await oracle.generateStatementId(
        Field(1),
        true // will return a high result (true for holder, big balance, etc.), statement is valid
      );

      const txn = await Mina.transaction(user.publicKey, () => {
        zap.verify(
          oracleResult.data.statementId,
          oracleResult.data.privateData,
          oracleResult.signature ??
            fail('something is wrong with the signature')
        );
      });
      await txn.prove();
      await txn.sign([user.privateKey]).send();

      const events = await zap.fetchEvents();
      const verifiedEventValue = events[0].event.data.toFields(null)[0];
      expect(events[0].type).toEqual('verified');
      expect(verifiedEventValue).toEqual(oracleResult.data.statementId);
    });

    it('throws an error if the statement is invalid even if the provided signature is valid', async () => {
      const oracleResult: OracleResult = await oracle.generateStatementId(
        Field(1),
        false // will return a low result (true for holder, big balance, etc.), statement is invalid
      );
      expect(async () => {
        await Mina.transaction(user.publicKey, () => {
          zap.verify(
            oracleResult.data.statementId,
            oracleResult.data.privateData,
            oracleResult.signature ??
              fail('something is wrong with the signature')
          );
        });
      }).rejects;
    });

    it('throws an error if the statement is valid but the provided signature is invalid', async () => {
      const oracleResult: OracleResult = await oracle.generateStatementId(
        Field(1),
        true // will return a high result (true for holder, big balance, etc.)
      );

      const signature = Signature.create(zapKeys.privateKey, [
        oracleResult.data.statementId,
        oracleResult.data.privateData,
        Field(0), // <- this is the invalid part
      ]);

      expect(async () => {
        await Mina.transaction(user.publicKey, () => {
          zap.verify(
            oracleResult.data.statementId,
            oracleResult.data.privateData,
            signature ?? fail('something is wrong with the signature')
          );
        });
      }).rejects;
    });
  });
});