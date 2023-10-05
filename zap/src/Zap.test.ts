import { MockedZap } from './MockedZap';
import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  Signature,
  Poseidon,
} from 'o1js';
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

  /* Statement is: 'balance of user of token with address 0xdac1..1ec7 is greater (>) than 600' */
  const statementBalanceSup: Statement = {
    route: '/balance/:0xdac17f958d2ee523a2206206994597c13d831ec7',
    args: null,
    condition: {
      type: 2,
      targetValue: 600,
    },
  };

  const ethereumAddress = '0x768D170EE896eb95714AB43aFCaC08F970607361';
  // Metamask signature corresponding to the `statementBalanceSup` statement, signed by the user 0x768...361
  const metamaskSignature =
    '0x7f3943a698c1b4d732a6d24073ff2b9a68d17bd3f0a517ad3a11bc044d1b79ce5e83bfecb3a454fa189f1960bb8cb7dd53482f2b6dcf047ea8b8c3bfa65751c61b';

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

  describe('Attestations creation', () => {
    describe('Modularity of requests', () => {
      it.only('emits the correct event for a valid statement: balance of user is 700, targetValue 600, operationType ">"', async () => {
        const oracleResult: OracleResult = await oracle.generateStatement(
          Field(1), // ApiRequestId corresponding to `getBalance`
          true, // will return a high result (true for holder, big balance for assets, etc.), so statement is valid
          metamaskSignature,
          ethereumAddress
        );

        console.log(
          'conditionType',
          Field.from(statementBalanceSup.condition.type)
        );
        console.log(
          'targetValue',
          Field.from(statementBalanceSup.condition.targetValue)
        );
        console.log('hashRoute', oracleResult.data.hashRoute);
        console.log('privateData',oracleResult.data.privateData);
        console.log('signature', oracleResult.signature);

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
          oracleResult.data.hashRoute,
          Field(statementBalanceSup.condition.type),
          Field(statementBalanceSup.condition.targetValue),
          user.publicKey.toFields()[0],
        ]);

        const eventsFetched = await zap.fetchEvents();
        const dataInEventFetched = eventsFetched[0].event.data;
        expect(eventsFetched[0].type).toEqual('verified');
        expect(dataInEventFetched).toEqual(expectedDataInEvent);
      });

      it('emits the correct event for a valid statement: balance of user is 500, targetValue 600, operationType "<"', async () => {
        /* Exact same test as above, but now we want to check that the balance is lower than 600 */
        // Thus, we change the condition type to 1 (lower than) and Oracle will return a value of 500 (LowOrHighResult = false)
        const oracleResult: OracleResult = await oracle.generateStatement(
          Field(1), // ApiRequestId corresponding to `getBalance`
          false, // will return a low result (true for holder, big balance for assets, etc.), so statement is valid here
          metamaskSignature,
          ethereumAddress
        );

        /* Statement is: 'balance of user of token with address 0xdac1..1ec7 is lower (<) than 600' */
        const statementBalanceInf: Statement = {
          route: '/balance/:0xdac17f958d2ee523a2206206994597c13d831ec7',
          args: null,
          condition: {
            type: 1, // <-- Change the condition type to 1 (lower than)
            targetValue: 600,
          },
        };

        const txn = await Mina.transaction(user.publicKey, () => {
          zap.verify(
            Field(statementBalanceInf.condition.type),
            Field(statementBalanceInf.condition.targetValue),
            oracleResult.data.hashRoute,
            oracleResult.data.privateData,
            oracleResult.signature ??
              fail('something is wrong with the signature')
          );
        });
        await txn.prove();
        await txn.sign([user.privateKey]).send();

        const expectedDataInEvent = Poseidon.hash([
          oracleResult.data.hashRoute,
          Field(statementBalanceInf.condition.type),
          Field(statementBalanceInf.condition.targetValue),
          user.publicKey.toFields()[0],
        ]);

        const eventsFetched = await zap.fetchEvents();
        const dataInEventFetched = eventsFetched[0].event.data;
        expect(eventsFetched[0].type).toEqual('verified');
        expect(dataInEventFetched).toEqual(expectedDataInEvent);
      });

      it('emits the correct event for a valid statement: balance of user is 500, targetValue 500, operationType "=="', async () => {
        /* Exact same test as above, but now we want to check that the balance is equals to 500 */
        // Thus, we change the condition type to 3 (equals to) and Oracle will return a value of 500 (LowOrHighResult = false)
        const oracleResult: OracleResult = await oracle.generateStatement(
          Field(1), // ApiRequestId corresponding to `getBalance`
          false, // will return a low result (true for holder, big balance for assets, etc.), so statement is valid here
          metamaskSignature,
          ethereumAddress
        );

        /* Statement is: 'balance of user of token with address 0xdac1..1ec7 is equals (==) to 500' */
        const statementBalanceEqual: Statement = {
          route: '/balance/:0xdac17f958d2ee523a2206206994597c13d831ec7',
          args: null,
          condition: {
            type: 3, // <-- Change the condition type to 3 (equals to)
            targetValue: 500, // <-- Change the target value to 500
          },
        };

        const txn = await Mina.transaction(user.publicKey, () => {
          zap.verify(
            Field(statementBalanceEqual.condition.type),
            Field(statementBalanceEqual.condition.targetValue),
            oracleResult.data.hashRoute,
            oracleResult.data.privateData,
            oracleResult.signature ??
              fail('something is wrong with the signature')
          );
        });
        await txn.prove();
        await txn.sign([user.privateKey]).send();

        const expectedDataInEvent = Poseidon.hash([
          oracleResult.data.hashRoute,
          Field(statementBalanceEqual.condition.type),
          Field(statementBalanceEqual.condition.targetValue),
          user.publicKey.toFields()[0],
        ]);

        const eventsFetched = await zap.fetchEvents();
        const dataInEventFetched = eventsFetched[0].event.data;
        expect(eventsFetched[0].type).toEqual('verified');
        expect(dataInEventFetched).toEqual(expectedDataInEvent);
      });

      it.skip('emits the correct event for a valid statement: balance of user is 500, targetValue 499, operationType "!="', async () => {
        /* Exact same test as above, but now we want to check that the balance is different to 499 */
        // Thus, we change the condition type to 4 (different to) and Oracle will return a value of 500 (LowOrHighResult = false)
        const oracleResult: OracleResult = await oracle.generateStatement(
          Field(1), // ApiRequestId corresponding to `getBalance`
          false, // will return a low result (true for holder, big balance for assets, etc.), so statement is valid here
          metamaskSignature,
          ethereumAddress
        );

        /* Statement is: 'balance of user of token with address 0xdac1..1ec7 is different (!=) to 499' */
        const statementBalanceDiff: Statement = {
          route: '/balance/:0xdac17f958d2ee523a2206206994597c13d831ec7',
          args: null,
          condition: {
            type: 4, // <-- Change the condition type to 4 (different to)
            targetValue: 499, // <-- Change the target value to 499
          },
        };

        const txn = await Mina.transaction(user.publicKey, () => {
          zap.verify(
            Field(statementBalanceDiff.condition.type),
            Field(statementBalanceDiff.condition.targetValue),
            oracleResult.data.hashRoute,
            oracleResult.data.privateData,
            oracleResult.signature ??
              fail('something is wrong with the signature')
          );
        });
        await txn.prove();
        await txn.sign([user.privateKey]).send();

        const expectedDataInEvent = Poseidon.hash([
          oracleResult.data.hashRoute,
          Field(statementBalanceDiff.condition.type),
          Field(statementBalanceDiff.condition.targetValue),
          user.publicKey.toFields()[0],
        ]);

        const eventsFetched = await zap.fetchEvents();
        const dataInEventFetched = eventsFetched[0].event.data;
        expect(eventsFetched[0].type).toEqual('verified');
        expect(dataInEventFetched).toEqual(expectedDataInEvent);
      });
    });

    it('throws an error if the statement is invalid (balance of user is 500, should be greater than 600)', async () => {
      // oracle will return a value of 500, which is not greater than 600 => invalid statement
      const oracleResult: OracleResult = await oracle.generateStatement(
        Field(1), // ApiRequestId corresponding to `getBalance`
        false, // will return a low result (true for holder, big balance for assets, etc.), leading to an invalid statement
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
      }).rejects.toThrow('Bool.assertTrue(): false != true');
    });

    it('throws an error if the signature provided by the oracle is invalid (oracleSignature is not coming from the expected Oracle)', async () => {
      const oracleResult: OracleResult = await oracle.generateStatement(
        Field(1),
        true, // will return a high result (true for holder, big balance for assets, etc.), so statement is valid
        metamaskSignature,
        ethereumAddress
      );

      const wrongPrivateKey = generateKeyPair().privateKey;

      const invalidOracleSignature = Signature.create(wrongPrivateKey, [
        // <-- Signed with a wrong private key
        oracleResult.data.hashRoute,
        oracleResult.data.privateData,
      ]);

      expect(async () => {
        await Mina.transaction(user.publicKey, () => {
          zap.verify(
            Field(statementBalanceSup.condition.type),
            Field(statementBalanceSup.condition.targetValue),
            oracleResult.data.hashRoute,
            oracleResult.data.privateData,
            invalidOracleSignature ??
              fail('something is wrong with the signature')
          );
        });
      }).rejects.toThrow('Bool.assertTrue(): false != true');
    });

    it('throws an error if the signature provided by the oracle is invalid (wrong hashRoot, meaning that oracle called the wrong statement)', async () => {
      const oracleResult: OracleResult = await oracle.generateStatement(
        Field(1),
        true, // will return a high result (true for holder, big balance for assets, etc.), so statement is valid
        metamaskSignature,
        ethereumAddress
      );

      const wrongHashRoute = Poseidon.hash([
        Field('/balance/:0xShittyToken'), // <-- Wrong hashRoute
      ]);

      const invalidOracleSignature = Signature.create(zapKeys.privateKey, [
        wrongHashRoute,
        oracleResult.data.privateData,
      ]);

      expect(async () => {
        await Mina.transaction(user.publicKey, () => {
          zap.verify(
            Field(statementBalanceSup.condition.type),
            Field(statementBalanceSup.condition.targetValue),
            oracleResult.data.hashRoute,
            oracleResult.data.privateData,
            invalidOracleSignature ??
              fail('something is wrong with the signature')
          );
        });
      }).rejects.toThrow('Bool.assertTrue(): false != true');
    });

    it('throws an error if the Metamask signature of the caller is invalid', async () => {
      await expect(async () => {
        await oracle.generateStatement(
          Field(1),
          true, // will return a high result (true for holder, big balance for assets, etc.), statement is valid
          'invalid_metamask_signature',
          ethereumAddress
        );
      }).rejects.toThrow('signature of the caller is invalid');
    });
  });
});
