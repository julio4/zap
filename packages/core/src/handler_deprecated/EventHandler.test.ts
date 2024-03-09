import { EventHandler } from './EventHandler';
import { Attestation } from '../Attestation';
import { AccountUpdate, Mina, PrivateKey } from 'o1js';
import { ProvableStatement } from '../Statement';
import { KeyPair, Statement } from '@zap/types';
import { generateKeyPair } from '@zap/shared';

let proofsEnabled = false;

async function localDeploy(
  app: EventHandler,
  appKeys: KeyPair,
  deployer: KeyPair
) {
  const tx = await Mina.transaction(deployer.publicKey, () => {
    AccountUpdate.fundNewAccount(deployer.publicKey);
    app.deploy({
      zkappKey: appKeys.privateKey,
    });
  });
  await tx.prove();
  await tx.sign([deployer.privateKey, appKeys.privateKey]).send();
}

describe('EventHandler', () => {
  let attestation: Attestation;
  let eventHandler: EventHandler,
    deployer: KeyPair,
    handlerKeys: KeyPair,
    user: KeyPair;

  beforeEach(async () => {
    // create local blockchain
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    // Set up keys
    deployer = Local.testAccounts[0];
    handlerKeys = generateKeyPair();
    user = Local.testAccounts[1];

    eventHandler = new EventHandler(handlerKeys.publicKey);
    await EventHandler.compile();
    await localDeploy(eventHandler, handlerKeys, deployer);
  });

  it('should emit verified event with correct attestation hash', async () => {
    const sourceKey = PrivateKey.random().toPublicKey();
    const statement: Statement = {
      sourceKey: sourceKey.toBase58(),
      route: {
        path: '/route',
        args: {},
      },
      condition: {
        type: 1,
        targetValue: 1,
      },
    };

    attestation = new Attestation({
      statement: ProvableStatement.from(statement),
      address: user.publicKey, // TODO: which address should be used here?
    });

    const txn = await Mina.transaction(user.publicKey, () => {
      eventHandler.handle(attestation);
    });
    await txn.prove();
    await txn.sign([user.privateKey]).send();

    const expectedDataInEvent = attestation.hash();
    const eventsFetched = await eventHandler.fetchEvents();

    const dataInEventFetched = eventsFetched[0].event.data;
    expect(eventsFetched[0].type).toEqual('verified');
    expect(dataInEventFetched).toEqual(expectedDataInEvent);
  });
});
