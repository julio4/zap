import {
  Field,
  SmartContract,
  method,
  DeployArgs,
  Permissions,
  Signature,
  AccountUpdate,
  Bool,
} from 'o1js';
import { ProvableStatement } from '../Statement.js';

interface IVerifier {
  verify(
    // The statement
    statement: ProvableStatement,
    // The value given to the statement variable used to verify the statement and emit the attestation
    privateData: Field,
    signature: Signature
  ): void;
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

  @method verify(
    statement: ProvableStatement,
    privateData: Field,
    signature: Signature
  ): Bool {
    // STATEMENT/ATTESTATION VERIFICATION
    statement.assertValidSignature(privateData, signature);
    statement.assertValidCondition(privateData);

    // ATTESTATION GENERATION
    const sender = this.sender;
    AccountUpdate.createSigned(sender);

    // ATTESTATION HANDLING
    return Bool(true);
  }
}
