import { SmartContract, method, Permissions, Bool } from 'o1js';
import { Attestation } from '../Attestation.js';

interface IVerifier {
  verify(attestation: Attestation): Promise<Bool>;
}

/**
 * ZAP: Zero-knowledge Attestation Protocol
 *
 * This contract attests the validity of statements.
 * The statement are validated with data signed by a source.
 * The contract emits an event containing the verified statement id -> it's an attestation.
 */
export class Verifier extends SmartContract implements IVerifier {
  init() {
    super.init();
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method.returns(Bool)
  async verify(attestation: Attestation): Promise<Bool> {
    return attestation.isValid();
  }
}
