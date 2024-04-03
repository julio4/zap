import { PrivateKey, Poseidon } from 'o1js';
import { Source } from './Source';
import { stringToFields } from 'o1js/dist/node/bindings/lib/encoding';

describe('Source', () => {
  let source: Source = Source.from(
    PrivateKey.random().toPublicKey(),
    stringToFields('http://test.com')[0],
    stringToFields('name')[0],
    stringToFields('description')[0]
  );

  it('hashes the source', () => {
    const expectedHash = Poseidon.hash([
      Poseidon.hash(source.publicKey.toFields()),
      source.urlApi,
      source.name,
      source.description,
    ]);
    const hash = source.hash();
    expect(hash).toBeDefined();
    expect(hash).toEqual(expectedHash);
  });
});
