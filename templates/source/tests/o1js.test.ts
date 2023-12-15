// This is a jest test file from `o1js`
// Because ts and jest config is really complicated to make o1js, express, supertest work together
// This is to ensure that testing o1js works
// TODO remove later when testing is done

import { isReady, shutdown, Field, MerkleMap } from 'o1js';

describe('Merkle Map', () => {
  beforeAll(async () => {
    await isReady;
  });
  afterAll(async () => {
    setTimeout(shutdown, 0);
  });

  it('set and get a value from a key', () => {
    const map = new MerkleMap();

    const key = Field.random();
    const value = Field.random();

    map.set(key, value);

    expect(map.get(key).equals(value).toBoolean());
  });

  it('check merkle map witness computes the correct root and key', () => {
    const map = new MerkleMap();

    const key = Field.random();
    const value = Field.random();

    map.set(key, value);

    const witness = map.getWitness(key);

    const emptyMap = new MerkleMap();

    const [emptyLeafWitnessRoot, witnessKey] = witness.computeRootAndKey(
      Field(0)
    );
    const [witnessRoot, _] = witness.computeRootAndKey(value);

    expect(
      emptyLeafWitnessRoot.equals(emptyMap.getRoot()).toBoolean() &&
        witnessKey.equals(key).toBoolean() &&
        witnessRoot.equals(map.getRoot()).toBoolean()
    );
  });
});
