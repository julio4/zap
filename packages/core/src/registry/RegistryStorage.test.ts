import { Poseidon, PrivateKey } from 'o1js';
import { initialRoot, RegistryStorage } from './RegistryStorage';

describe('RegistryStorage', () => {
  const registryStorage = new RegistryStorage();

  it('should init with correct initial state', async () => {
    expect(registryStorage.tree.getRoot()).toEqual(initialRoot);
    expect(registryStorage.tree.height).toEqual(20);
    expect(registryStorage.index).toEqual(0);
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
