import {
  SmartContract,
  Field,
  state,
  State,
  method,
  DeployArgs,
  Permissions,
  MerkleMapWitness,
} from 'o1js';

import { initialRoot, RegistryStorage } from './RegistryStorage';
import { Source } from './Source';

export type IRegistry = {
  // States
  registryRoot: State<Field>;
  register(witness: MerkleMapWitness, source: Source): void;
};

/**
 * Registry: This contract is used as a registry of Zap sources.
 *
 * A source can be registered by anyone, but it can only be registered once.
 * A source is identified by its public key.
 * The storage of the registry is offchain, and this contract is only used to verify the integrity of the registry.
 * => Potentially adds metadata later on.
 */
export class Registry extends SmartContract implements IRegistry {
  @state(Field) registryRoot = State<Field>();
  @state(Field) registryStorage = new RegistryStorage();

  init() {
    super.init();
    this.registryRoot.set(initialRoot);
  }

  events = {
    registered: Field,
  };

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method register(witness: MerkleMapWitness, source: Source) {
    // Check if root has changed
    const previousRoot = this.registryRoot.getAndRequireEquals();
    const [emptyRoot] = witness.computeRootAndKey(Field(0)); // New leaf starts with 0
    emptyRoot.assertEquals(previousRoot);

    // Add the source to the tree by updating the root with the new leaf, TODO: add the entire struct with toFields method
    // for the moment we only add the name
    const [newRoot] = witness.computeRootAndKey(source.name.toFields()[0]);

    // Update the root
    this.registryRoot.set(newRoot);

    // Emit the event with the registered public key
    // Can be used to keep in sync the offchain registry
    this.emitEvent('registered', source.publicKey.toFields()[0]);
  }
}
