import {
  Field,
  MerkleMap,
  MerkleMapWitness,
  Poseidon,
  PublicKey,
} from 'o1js';

import { Source } from './Source';

export const initialRoot = new MerkleMap().getRoot();

/**
 * Simple implementation of a off-chain storage to keep track of the Registry state.
 */
export class RegistryStorage {
  map: MerkleMap;
  count: number;

  constructor() {
    this.map = new MerkleMap();
    this.count = 0;
  }

  assertSynced = (root: Field) => {
    this.map.getRoot().assertEquals(root);
  };

  insert = (source: Source): MerkleMapWitness => {
    const hashedPublicKey = Poseidon.hash(source.publicKey.toFields());
    this.map.set(hashedPublicKey, source.name.toFields()[0]); // TODO: store the entire struct
    const witness = this.map.getWitness(hashedPublicKey);
    this.count += 1;
    return witness;
  };

  getValue = (publicKey: PublicKey): Field => {
    const hashedPublicKey = Poseidon.hash(publicKey.toFields());
    return this.map.get(hashedPublicKey);
  };
}
