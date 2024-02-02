import { Field, MerkleTree, MerkleWitness, Poseidon, PublicKey } from 'o1js';

const height = 20;
export class RegistryMerkleWitness extends MerkleWitness(height) {}
export class RegistryMerkleTree extends MerkleTree {
  constructor() {
    super(height);
  }
}
export const initialRoot = new RegistryMerkleTree().getRoot();

/**
 * Simple implementation of a off-chain storage to keep track of the Registry state.
 */
export class RegistryStorage {
  tree: RegistryMerkleTree;
  index: number;

  constructor() {
    this.tree = new RegistryMerkleTree();
    this.index = 0;
  }

  assertSynced = (root: Field) => {
    this.tree.getRoot().assertEquals(root);
  };

  insert = (publicKey: PublicKey): RegistryMerkleWitness => {
    const hashedPublicKey = Poseidon.hash(publicKey.toFields());
    const nextLeaf = BigInt(this.index);
    this.tree.setLeaf(nextLeaf, hashedPublicKey);
    const witness = this.tree.getWitness(nextLeaf);
    this.index += 1;
    return new RegistryMerkleWitness(witness);
  };
}
