import { Registry } from './Registry';
import { RegistryStorage, initialRoot } from './RegistryStorage';
import { Mina, PrivateKey, PublicKey, AccountUpdate, Poseidon } from 'o1js';
import { Source } from './Source';
import { stringToFields } from 'o1js/dist/node/bindings/lib/encoding';

let proofsEnabled = false;

describe('Registry', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Registry,
    registryStorage: RegistryStorage;

  let newSource: Source = {
    publicKey: PrivateKey.random().toPublicKey(),
    urlApi: stringToFields('http://test.com')[0],
    name: stringToFields('name')[0],
    description: stringToFields('description')[0],
  };

  beforeAll(async () => {
    if (proofsEnabled) {
      await Registry.compile();
    }
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    // ({ privateKey: senderKey, publicKey: senderAccount } =
    //   Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Registry(zkAppAddress);
    registryStorage = new RegistryStorage();
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy({
        zkappKey: zkAppPrivateKey,
      });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `Registry` smart contract', async () => {
    await localDeploy();
    const initialRegistryRoot = await zkApp.registryRoot.get();
    expect(initialRegistryRoot).toEqual(initialRoot);
  });

  it('registers a new source', async () => {
    await localDeploy();
    registryStorage.insert(newSource);

    let witness = registryStorage.map.getWitness(
      Poseidon.hash(newSource.publicKey.toFields())
    );

    const txn = await Mina.transaction(deployerAccount, () => {
      zkApp.register(witness, newSource);
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

    const updatedRegistryRoot = await zkApp.registryRoot.get();
    expect(updatedRegistryRoot).not.toEqual(initialRoot);

    const hashedPublicKey = Poseidon.hash(newSource.publicKey.toFields());
    expect(registryStorage.map.get(hashedPublicKey)).toEqual(
      stringToFields('name')[0]
    );
    expect(registryStorage.map.get(hashedPublicKey)).not.toEqual(
      stringToFields('namee')[0]
    );
    expect(registryStorage.count).toEqual(1);
  });

  it('throws an error when trying to register the same source twice', async () => {
    await localDeploy();

    registryStorage.insert(newSource);

    let witness = registryStorage.map.getWitness(
      Poseidon.hash(newSource.publicKey.toFields())
    );

    const txn = await Mina.transaction(deployerAccount, () => {
      zkApp.register(witness, newSource);
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

    const updatedRegistryRoot = await zkApp.registryRoot.get();
    expect(updatedRegistryRoot).not.toEqual(initialRoot);

    await expect(
      Mina.transaction(deployerAccount, () => {
        zkApp.register(witness, newSource);
      })
    ).rejects.toThrow();
  });

  it('emits a `registered` event when a source is registered', async () => {
    await localDeploy();

    registryStorage.insert(newSource);

    let witness = registryStorage.map.getWitness(
      Poseidon.hash(newSource.publicKey.toFields())
    );

    const txn = await Mina.transaction(deployerAccount, () => {
      zkApp.register(witness, newSource);
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

    const eventsFetched = await zkApp.fetchEvents();
    const dataInEventFetched = eventsFetched[0].event.data;
    const expectedData = newSource.publicKey.toFields()[0];
    expect(eventsFetched[0].type).toEqual('registered');
    expect(dataInEventFetched).toEqual(expectedData);
  });
});
