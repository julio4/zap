import { Statement } from '@zap/types';
import { ProvableStatement } from '../Statement';
import { EventCaller } from './EventCaller';
import { Verifier } from '../verifier/Verifier';

import { Mina, PrivateKey, PublicKey, AccountUpdate, Field } from 'o1js';
import { Attestation } from '../Attestation';
import { TestPublicKey } from 'o1js/dist/node/lib/mina/local-blockchain';

let proofsEnabled = false;

describe('EventCaller', () => {
  let deployer: TestPublicKey,
    user: TestPublicKey,
    eventCallerAddress: PublicKey,
    eventCallerPrivateKey: PrivateKey,
    eventCaller: EventCaller,
    verifierAddress: PublicKey,
    verifierPrivateKey: PrivateKey,
    verifier: Verifier;

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
      await EventCaller.compile();
      await Verifier.compile();
    }
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    deployer = Local.testAccounts[0];
    user = Local.testAccounts[1];
    eventCallerPrivateKey = PrivateKey.random();
    eventCallerAddress = eventCallerPrivateKey.toPublicKey();
    eventCaller = new EventCaller(eventCallerAddress);

    verifierPrivateKey = PrivateKey.random();
    verifierAddress = verifierPrivateKey.toPublicKey();
    verifier = new Verifier(verifierAddress);
  });

  async function localDeployEventCaller() {
    const txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      eventCaller.deploy();
    });
    await txn.prove();
    await txn.sign([deployer.key, eventCallerPrivateKey]).send();
  }

  async function localDeployVerifier() {
    const txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      verifier.deploy();
    });
    await txn.prove();
    await txn.sign([deployer.key, verifierPrivateKey]).send();
  }

  it('deploys the `EventCaller` smart contract', async () => {
    await localDeployEventCaller();
  });

  it('should emit verified event with correct attestation hash', async () => {
    await localDeployVerifier();
    await localDeployEventCaller();

    const provableStatement = ProvableStatement.from(statement);
    const privateData = new Field(1);
    const signature = ProvableStatement.sign(
      statement,
      privateData,
      sourcePrivateKey
    );

    const attestation = new Attestation({
      statement: provableStatement,
      privateData,
      signature,
      address: user,
    });

    const txn = await Mina.transaction(user, async () => {
      eventCaller.call(attestation, verifierAddress);
    });
    await txn.prove();
    await txn.sign([user.key]).send();

    const expectedDataInEvent = attestation.hash();
    const eventsFetched = await eventCaller.fetchEvents();

    const dataInEventFetched = eventsFetched[0].event.data;
    expect(eventsFetched[0].type).toEqual('verified');
    expect(dataInEventFetched).toEqual(expectedDataInEvent);
  });

  it("shouldn't emit verified event if attestation is not verified", async () => {
    await localDeployVerifier();
    await localDeployEventCaller();

    const provableStatement = ProvableStatement.from(statement);
    const privateData = new Field(5);
    const signature = ProvableStatement.sign(
      statement,
      privateData,
      sourcePrivateKey
    );
    const invalidAttestation = new Attestation({
      statement: provableStatement,
      privateData,
      signature,
      address: user,
    });

    expect(
      Mina.transaction(user, async () => {
        eventCaller.call(invalidAttestation, verifierAddress);
      })
    ).rejects.toThrow('Bool.assertTrue(): false != true');
  });
});
