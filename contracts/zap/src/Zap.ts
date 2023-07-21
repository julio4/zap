import {
  Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Permissions,
  PublicKey,
  Signature,
} from 'snarkyjs';

// The public key of our trusted data provider
const ORACLE_PUBLIC_KEY = 'B62qoAE4rBRuTgC42vqvEyUqCGhaZsW58SKVW4Ht8aYqP9UTvxFWBgy';

/**
 * ZAP: Zero-knowledge Attestation Protocol
 *
 * This contract attests the validity of statements.
 * The statement are validated with data signed by a trusted data provider.
 * The contract emits an event containing the verified statement id -> it's an attestation.
 */
export class Zap extends SmartContract {
  @state(PublicKey) oraclePublicKey = State<PublicKey>();

  // contract events
  events = {
    verified: Field,
  };

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  init() {
    super.init();

    // Initialize contract state
    this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
  }

  @method verify(statementId: Field, privateData: Field, signature: Signature) {
    // SIGNATURE VERIFICATION: START
    // Get the oracle public key from the contract state
    const oraclePublicKey = this.oraclePublicKey.getAndAssertEquals();

    // Evaluate whether the signature is valid for the provided data
    const validSignature = signature.verify(oraclePublicKey, [
      statementId,
      privateData,
    ]);

    // Check that the signature is valid
    validSignature.assertTrue();
    // SIGNATURE VERIFICATION: END

    // STATEMENT VERIFICATION: START

    // TODO: based on the statementId, verify that the privateData attest the statement
    // WARNING: fixed for now!

    // STATEMENT VERIFICATION: END

    // Emit an event containing the verified statement id
    this.emitEvent('verified', statementId);
  }
}
