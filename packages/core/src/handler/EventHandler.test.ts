import { EventHandler } from './EventHandler';
import { Attestation } from '../Attestation';
import { AccountUpdate, Field, Mina, Poseidon, PrivateKey } from 'o1js';
import { ProvableStatement } from '../Statement';
import { KeyPair } from '@zap/types';
import { Handler } from './Handler';
// import { generateKeyPair } from '@zap/shared';

let proofsEnabled = false;

async function localDeploy(app: Handler, appKeys: KeyPair, deployer: KeyPair) {
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
  let eventHandler: EventHandler;
  let attestation: Attestation;
  let zkappHandler: Handler, deployer: KeyPair, handlerKeys: KeyPair;

  //   beforeEach(() => {
  //     const sourceKey = PrivateKey.random().toPublicKey();
  //     const addressSource = PrivateKey.random().toPublicKey();
  //     const addressHandler = PrivateKey.random().toPublicKey();
  //     const statement = {
  //       sourceKey: sourceKey.toBase58(),
  //       route: '/route',
  //       condition: {
  //         type: 1,
  //         targetValue: 1,
  //       },
  //     };
  //     attestation = new Attestation({
  //       statement: ProvableStatement.from(statement),
  //       address: addressSource,
  //     });
  //     eventHandler = new EventHandler(addressHandler);
  //   });

  beforeEach(async () => {
    // create local blockchain
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    // Set up keys
    deployer = Local.testAccounts[0];
    // handlerKeys = generateKeyPair();

    // // Deploy the zap contract
    // zkappHandler = new Handler(handlerKeys.publicKey);
    // await Handler.compile();
    // await localDeploy(zkappHandler, handlerKeys, deployer);
  });

  it('should emit verified event with correct attestation hash', () => {
    eventHandler.handle(attestation);
    expect(eventHandler.events.verified).toEqual(attestation.hash());
  });
});
