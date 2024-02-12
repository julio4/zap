import { Registry } from './Registry';
import { RegistryStorage, initialRoot } from './RegistryStorage';
import { Mina, PrivateKey, PublicKey, AccountUpdate, Poseidon } from 'o1js';

let proofsEnabled = false;

describe('Registry', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Registry,
    registryStorage: RegistryStorage;

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

  it('registers a public key', async () => {
    await localDeploy();
    const newSourcePublicKey = PrivateKey.random().toPublicKey();
    const hashedPublicKey = Poseidon.hash(newSourcePublicKey.toFields());
    const witness = registryStorage.insert(newSourcePublicKey);

    const txn = await Mina.transaction(deployerAccount, () => {
      zkApp.register(witness, newSourcePublicKey);
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

    const updatedRegistryRoot = await zkApp.registryRoot.get();
    expect(updatedRegistryRoot).not.toEqual(initialRoot);
    expect(updatedRegistryRoot).toEqual(witness.calculateRoot(hashedPublicKey));
  });

  it('throws an error when trying to register the same public key twice', async () => {
    // test with same witness. Atm we don't throw if adding same key but with different witness
    await localDeploy();
    const newSourcePublicKey = PrivateKey.random().toPublicKey();
    const witness = registryStorage.insert(newSourcePublicKey);

    const txn = await Mina.transaction(deployerAccount, () => {
      zkApp.register(witness, newSourcePublicKey);
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

    const updatedRegistryRoot = await zkApp.registryRoot.get();
    expect(updatedRegistryRoot).not.toEqual(initialRoot);

    await expect(
      Mina.transaction(deployerAccount, () => {
        zkApp.register(witness, newSourcePublicKey);
      })
    ).rejects.toThrow();
  });
});
