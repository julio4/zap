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
import { Zap } from './Zap';
import { stringToFields } from 'o1js/dist/node/bindings/lib/encoding';

// Speed up testing by disabling proofs for unit tests
let proofsEnabled = false;

function generateKeyPair(): KeyPair {
  const privateKey = PrivateKey.random();
  const publicKey = privateKey.toPublicKey();
  return { privateKey, publicKey };
}

async function localDeploy(app: Zap, appKeys: KeyPair, deployer: KeyPair) {
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
  let zap: Zap,
    oracle: MockedOracle,
    deployer: KeyPair,
    zapKeys: KeyPair,
    user: KeyPair;

  /* Statement is: 'balance of user of token with address 0xdac1..1ec7 is greater (>) than 600' */
  const statementBalanceSup: Statement = {
    route: '/balance', // todo: not necessary to put route here, see where it is used
    args: null,
    condition: {
      type: 2,
      targetValue: 600,
    },
  };

  const ethereumAddress = '0x1a737A9eA21f6E087c2e74a0c620f81dA76bf49E';
  // Metamask signature of the caller
  const metamaskSignature =
    '0x776038715080d4d08417b7a62a4fa390cc476eed90fafb043a30a77a3f54914f397685de38c50e3f38e90d717202423c154ff86dac0ab34b71247da91317b4471b';

  beforeEach(async () => {
    // create local blockchain
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    // Set up keys
    deployer = Local.testAccounts[0];
    zapKeys = generateKeyPair();
    user = Local.testAccounts[1];

    // Deploy the zap contract
    zap = new Zap(zapKeys.publicKey);
    await Zap.compile();
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

        console.log('targetValue: ', statementBalanceSup.condition.targetValue);
        console.log('privateData: ', oracleResult.data.privateData);
        console.log('conditionType: ', statementBalanceSup.condition.type);
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
            type: 1, // <-- condition type to 1 (lower than)
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
        stringToFields('/balance/:0xShittyToken')[0], // <-- Wrong hashRoute
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
