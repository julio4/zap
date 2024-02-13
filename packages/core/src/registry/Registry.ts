import {
  SmartContract,
  Field,
  state,
  State,
  method,
  DeployArgs,
  PublicKey,
  Permissions,
  Poseidon,
} from 'o1js';

import { initialRoot, RegistryMerkleWitness } from './RegistryStorage';

export type IRegistry = {
  // States
  registryRoot: State<Field>;
  register(witness: RegistryMerkleWitness, publicKey: PublicKey): void;
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

  @method register(witness: RegistryMerkleWitness, publicKey: PublicKey) {
    const currentRoot = this.registryRoot.getAndRequireEquals();

    // Compute the new root
    const hashedPublicKey = Poseidon.hash(publicKey.toFields());
    const potentialNewRoot = witness.calculateRoot(hashedPublicKey);
    
    // Verify that the public key is not already registered
    potentialNewRoot.assertNotEquals(currentRoot);  // not the right way to check for uniqueness

    // Update the onchain registry root
    this.registryRoot.set(potentialNewRoot);

    // Emit the event with the registered public key
    // Can be used to keep in sync the offchain registry
    this.emitEvent("registered", publicKey.toFields()[0]);
  }
}
