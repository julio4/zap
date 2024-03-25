import {
  SmartContract,
  Field,
  state,
  State,
  method,
  DeployArgs,
  Permissions,
  MerkleMapWitness,
  PublicKey
} from 'o1js';

import { initialRoot, RegistryStorage } from './RegistryStorage.js';
import { Source } from './Source.js';

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
  @state(PublicKey) storageServerPublicKey = State<PublicKey>();
  @state(Field) registryRoot = State<Field>();
  @state(Field) registryStorage = new RegistryStorage();

  @method initState(storageServerPublicKey: PublicKey) {
    super.init();
    this.registryRoot.set(initialRoot);
    this.storageServerPublicKey.set(storageServerPublicKey);
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

    const [newRoot] = witness.computeRootAndKey(source.hash());

    // Update the root
    this.registryRoot.set(newRoot);

    // Emit the event with the registered public key
    // Can be used to keep in sync the offchain registry
    this.emitEvent('registered', source.publicKey.toFields()[0]);
  }
}
