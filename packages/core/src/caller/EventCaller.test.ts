import { EventCaller } from './EventCaller';
import { Attestation } from '../Attestation';
import { AccountUpdate, Field, Mina, PrivateKey } from 'o1js';
import { ProvableStatement } from '../Statement';
import { KeyPair, Statement } from '@zap/types';
import { generateKeyPair } from '@zap/shared';
import { Verifier } from '../verifier/Verifier';

let proofsEnabled = false;

describe('EventCaller', () => {
  let attestation: Attestation;
  let deployerKeys: KeyPair,
    userKeys: KeyPair,
    eventCallerKeys: KeyPair,
    eventCaller: EventCaller,
    verifierKeys: KeyPair,
    verifier: Verifier;

  async function localDeployVerifier() {
    const txn = await Mina.transaction(deployerKeys.publicKey, () => {
      AccountUpdate.fundNewAccount(deployerKeys.publicKey);
      verifier.deploy({
        zkappKey: verifierKeys.privateKey,
      });
    });
    await txn.prove();
    await txn.sign([deployerKeys.privateKey, verifierKeys.privateKey]).send();
  }

  async function localDeployHandler() {
    const txn = await Mina.transaction(deployerKeys.publicKey, () => {
      AccountUpdate.fundNewAccount(deployerKeys.publicKey);
      eventCaller.deploy({
        zkappKey: eventCallerKeys.privateKey,
      });
    });
    await txn.prove();
    await txn
      .sign([deployerKeys.privateKey, eventCallerKeys.privateKey])
      .send();
  }

  beforeEach(async () => {
    // create local blockchain
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    // Set up keys
    deployerKeys = Local.testAccounts[0];
    userKeys = Local.testAccounts[1];
    eventCallerKeys = generateKeyPair();
    verifierKeys = generateKeyPair();

    eventCaller = new EventCaller(eventCallerKeys.publicKey);
    await EventCaller.compile();
    verifier = new Verifier(verifierKeys.publicKey);
    await Verifier.compile();
    await localDeployVerifier();
    await localDeployHandler();
  });

  it.only('should deploy', async () => {
    await localDeployVerifier();
    await localDeployHandler();
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
        type: 3, // "target == 1"
        targetValue: 1,
      },
    };

    const signature = ProvableStatement.sign(
      statement,
      Field(1),
      userKeys.privateKey
    );

    const provableStatement = ProvableStatement.from(statement);

    const txn = await Mina.transaction(userKeys.publicKey, () => {
      eventCaller.call(provableStatement, Field(1), signature, verifierKeys.publicKey);
    });
    await txn.prove();
    await txn.sign([userKeys.privateKey]).send();

    const expectedDataInEvent = attestation.hash();
    const eventsFetched = await eventCaller.fetchEvents();

    const dataInEventFetched = eventsFetched[0].event.data;
    expect(eventsFetched[0].type).toEqual('verified');
    expect(dataInEventFetched).toEqual(expectedDataInEvent);
  });
});
