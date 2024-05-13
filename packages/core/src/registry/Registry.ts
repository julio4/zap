import {
  SmartContract,
  Field,
  state,
  State,
  method,
  Permissions,
  MerkleMapWitness,
  PublicKey,
  provablePure,
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

  init() {
    super.init();
    this.registryRoot.set(initialRoot);
    this.storageServerPublicKey.set(this.self.publicKey);
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  events = {
    registered: provablePure({
      publicKey: PublicKey,
      urlApi: Field,
      name: Field,
      description: Field,
    }),
  };

  @method async register(witness: MerkleMapWitness, source: Source) {
    // TODO: Add a check to ensure that the source is not already registered
    this.registryRoot.getAndRequireEquals();
    this.storageServerPublicKey.getAndRequireEquals();

    const [newRoot] = witness.computeRootAndKey(source.hash());

    // Update the root
    this.registryRoot.set(newRoot);

    // Emit the event with the registered public key
    // Can be used to keep in sync the offchain registry
    this.emitEvent('registered', {
      publicKey: source.publicKey,
      urlApi: source.urlApi,
      name: source.name,
      description: source.description,
    });
  }
}
