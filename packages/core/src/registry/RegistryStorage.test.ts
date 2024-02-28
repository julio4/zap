import { Poseidon, PrivateKey } from 'o1js';
import { initialRoot, RegistryStorage } from './RegistryStorage';
import { Source } from './Source';
import { stringToFields } from 'o1js/dist/node/bindings/lib/encoding';

describe('RegistryStorage', () => {
  const registryStorage = new RegistryStorage();

  it('should init with correct initial state', async () => {
    expect(registryStorage.map.getRoot()).toEqual(initialRoot);
    expect(registryStorage.count).toEqual(0);
  });

  it('assertSynced', async () => {
    expect(() => registryStorage.assertSynced(initialRoot)).not.toThrow();
    expect(() => registryStorage.assertSynced(initialRoot.add(1))).toThrow();
  });

  it('insert a new public key', async () => {
    const publicKey = PrivateKey.random().toPublicKey();
    const newSource: Source = {
      publicKey,
      urlApi: stringToFields("http://test.com")[0],
      name: stringToFields('name')[0],
      description: stringToFields('description')[0],
    };
    const witness = registryStorage.insert(newSource);
    const hashedPublicKey = Poseidon.hash(publicKey.toFields());
    expect(registryStorage.map.get(hashedPublicKey)).toEqual(stringToFields('name')[0]);
    expect(registryStorage.map.get(hashedPublicKey)).not.toEqual(stringToFields('namee')[0]);
    expect(registryStorage.count).toEqual(1);
    expect(registryStorage.map.getWitness(hashedPublicKey)).toEqual(witness);
  });
});
