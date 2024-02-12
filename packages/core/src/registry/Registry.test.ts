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

  it('assertSynced', async () => {
    expect(() => registryStorage.assertSynced(initialRoot)).not.toThrow();
    expect(() => registryStorage.assertSynced(initialRoot.add(1))).toThrow();
  });

  it('insert a new public key', async () => {
    const publicKey = PrivateKey.random().toPublicKey();
    const witness = registryStorage.insert(publicKey);
    const hashedPublicKey = Poseidon.hash(publicKey.toFields());
    expect(witness.calculateRoot(hashedPublicKey)).toEqual(
      registryStorage.tree.getRoot()
    );
  });
});
