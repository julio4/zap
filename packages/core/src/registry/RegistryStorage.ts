import { Field, MerkleMap, MerkleMapWitness, Poseidon, PublicKey } from 'o1js';

import { Source } from './Source';

export const initialRoot = new MerkleMap().getRoot();

/**
 * Simple implementation of a off-chain storage to keep track of the Registry state.
 */
export class RegistryStorage {
  storageMap: MerkleMap;
  count: number;

  constructor() {
    this.storageMap = new MerkleMap();
    this.count = 0;
  }

  assertSynced = (root: Field) => {
    this.storageMap.getRoot().assertEquals(root);
  };

  insert = (source: Source): MerkleMapWitness => {
    const hashedPublicKey = Poseidon.hash(source.publicKey.toFields());
    this.storageMap.set(hashedPublicKey, source.hash());
    const witness = this.storageMap.getWitness(hashedPublicKey);
    this.count += 1;
    return witness;
  };

  getValue = (publicKey: PublicKey): Field => {
    const hashedPublicKey = Poseidon.hash(publicKey.toFields());
    return this.storageMap.get(hashedPublicKey);
  };
}
