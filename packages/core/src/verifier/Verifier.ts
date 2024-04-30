import {
  SmartContract,
  method,
  DeployArgs,
  Permissions,
  Bool,
} from 'o1js';
import { Attestation } from '../Attestation.js';

interface IVerifier {
  verify(attestation: Attestation): void;
}

/**
 * ZAP: Zero-knowledge Attestation Protocol
 *
 * This contract attests the validity of statements.
 * The statement are validated with data signed by a source.
 * The contract emits an event containing the verified statement id -> it's an attestation.
 */
export class Verifier extends SmartContract implements IVerifier {
  deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method verify(attestation: Attestation): Bool {
    return attestation.isValid();
  }
}
