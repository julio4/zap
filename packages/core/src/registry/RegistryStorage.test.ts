import { Poseidon, PrivateKey } from 'o1js';
import { initialRoot, RegistryStorage } from './RegistryStorage';
import { Source } from './Source';
import { stringToFields } from 'o1js/dist/node/bindings/lib/encoding';

describe('RegistryStorage', () => {
  const registryStorage = new RegistryStorage();

  it('should init with correct initial state', async () => {
    expect(registryStorage.storageMap.getRoot()).toEqual(initialRoot);
    expect(registryStorage.count).toEqual(0);
  });

  it('assertSynced', async () => {
    expect(() => registryStorage.assertSynced(initialRoot)).not.toThrow();
    expect(() => registryStorage.assertSynced(initialRoot.add(1))).toThrow();
  });

  it('insert a new public key', async () => {
    const publicKey = PrivateKey.random().toPublicKey();
    const newSource: Source = Source.from(
      publicKey,
      stringToFields('http://test.com')[0],
      stringToFields('name')[0],
      stringToFields('description')[0]
    );
    const witness = registryStorage.insert(newSource);
    const hashedPublicKey = Poseidon.hash(publicKey.toFields());
    expect(registryStorage.storageMap.get(hashedPublicKey)).toEqual(
      stringToFields('name')[0]
    );
    expect(registryStorage.storageMap.get(hashedPublicKey)).not.toEqual(
      stringToFields('namee')[0]
    );
    expect(registryStorage.count).toEqual(1);
    expect(registryStorage.storageMap.getWitness(hashedPublicKey)).toEqual(
      witness
    );
  });

  it('getValue', async () => {
    const publicKey = PrivateKey.random().toPublicKey();

    const newSource: Source = Source.from(
      publicKey,
      stringToFields('http://test.com')[0],
      stringToFields('name')[0],
      stringToFields('description')[0]
    );
    registryStorage.insert(newSource);
    expect(registryStorage.getValue(publicKey)).toEqual(
      stringToFields('name')[0]
    );
    expect(registryStorage.getValue(publicKey)).not.toEqual(
      stringToFields('namee')[0]
    );
  });
});
