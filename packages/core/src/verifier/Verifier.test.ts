import { Statement } from '@zap/types';
import { ProvableStatement } from '../Statement';
import { Verifier } from './Verifier';
import { EventHandler } from '../handler_deprecated/EventHandler';

import { Mina, PrivateKey, PublicKey, AccountUpdate, Field } from 'o1js';

let proofsEnabled = false;

describe('Verifier', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    userAccount: PublicKey,
    userKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Verifier,
    handlerAddress: PublicKey,
    handlerPrivateKey: PrivateKey,
    handler: EventHandler;

  const sourcePrivateKey = PrivateKey.random();
  const sourceKey = sourcePrivateKey.toPublicKey();
  const statement: Statement = {
    sourceKey: sourceKey.toBase58(),
    route: {
      path: '/route',
      args: {},
    },
    // "target == 1"
    condition: {
      type: 3,
      targetValue: 1,
    },
  };

  beforeAll(async () => {
    if (proofsEnabled) {
      await Verifier.compile();
      await EventHandler.compile();
    }
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: userKey, publicKey: userAccount } = Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Verifier(zkAppAddress);

    handlerPrivateKey = PrivateKey.random();
    handlerAddress = handlerPrivateKey.toPublicKey();
    handler = new EventHandler(handlerAddress);
  });

  async function localDeployVerifier() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy({
        zkappKey: zkAppPrivateKey,
      });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  async function localDeployHandler() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      handler.deploy({
        zkappKey: handlerPrivateKey,
      });
    });
    await txn.prove();
    await txn.sign([deployerKey, handlerPrivateKey]).send();
  }

  it('deploys the `Verifier` smart contract', async () => {
    await localDeployVerifier();
  });

  it('verifies a statement with emitEvent handler', async () => {
    await localDeployVerifier();
    await localDeployHandler();

    const provableStatement = ProvableStatement.from(statement);
    const privateData = new Field(1);
    const signature = ProvableStatement.sign(
      statement,
      privateData,
      sourcePrivateKey
    );

    const txn = await Mina.transaction(userAccount, () => {
      zkApp.verify(provableStatement, privateData, signature);
    });

    await txn.prove();
    await txn.sign([userKey]).send();

    // const attestation = new Attestation({
    //   statement: provableStatement,
    //   address: userAccount,
    // });
    // const expectedDataInEvent = attestation.hash();
    // const eventsFetched = await handler.fetchEvents();
    // const dataInEventFetched = eventsFetched[0].event.data;
    // expect(eventsFetched[0].type).toEqual('verified');
    // expect(dataInEventFetched).toEqual(expectedDataInEvent);
  });

  it("should throw an error if the statement's signature is invalid", async () => {
    await localDeployVerifier();
    await localDeployHandler();

    const provableStatement = ProvableStatement.from(statement);
    const privateData = new Field(1);
    const signature = ProvableStatement.sign(
      statement,
      privateData,
      sourcePrivateKey
    );
    signature.r = Field.random();

    await expect(
      Mina.transaction(userAccount, () => {
        zkApp.verify(provableStatement, privateData, signature);
      })
    ).rejects.toThrow();
  });

  it('should throw an error if the statement condition is invalid', async () => {
    await localDeployVerifier();
    await localDeployHandler();

    const provableStatement = ProvableStatement.from(statement);
    const privateData = new Field(0);
    const signature = ProvableStatement.sign(
      statement,
      privateData,
      sourcePrivateKey
    );

    await expect(
      Mina.transaction(userAccount, () => {
        zkApp.verify(provableStatement, privateData, signature);
      })
    ).rejects.toThrow();
  });
});
