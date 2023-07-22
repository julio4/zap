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
  Provable,
  Bool,
  Poseidon,
} from 'snarkyjs';

// The public key of our trusted data provider
const ORACLE_PUBLIC_KEY =
  'B62qoAE4rBRuTgC42vqvEyUqCGhaZsW58SKVW4Ht8aYqP9UTvxFWBgy';

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

  @method verify(
    conditionType: Field,
    targetValue: Field,
    hashRoute: Field,
    privateData: Field,
    signature: Signature
  ) {
    /* VERIFICATION OF ORACLE SIGNATURE AND ROUTE: START */
    // Get the oracle public key from the contract state
    const oraclePublicKey = this.oraclePublicKey.getAndAssertEquals();

    // Evaluate whether the signature is valid for the provided data, and that the right
    // statement is being attested
    const validSignature = signature.verify(oraclePublicKey, [
      hashRoute,
      privateData,
    ]);

    // Check that the signature is valid
    validSignature.assertTrue();
    /* SIGNATURE VERIFICATION: END */

    /* STATEMENT VERIFICATION: START */
    // conditionType are <: 1, >: 2, ==: 3, !=: 4
    // determine which operator to use

    const whichOperator: Bool[] = [
      conditionType.equals(Field(1)),
      conditionType.equals(Field(2)),
      conditionType.equals(Field(3)),
      conditionType.equals(Field(4)),
    ];

    // verify that the privateData attest the statement
    const isPrivateDataValid = Provable.switch(whichOperator, Bool, [
      privateData.lessThan(targetValue), // privateData < targetValue
      privateData.greaterThan(targetValue), // privateData > targetValue
      privateData.equals(targetValue), // privateData == targetValue
      privateData.lessThan(targetValue) || privateData.greaterThan(targetValue), // privateData != targetValue
    ]);

    isPrivateDataValid.assertTrue();

    // STATEMENT VERIFICATION: END

    /* Generate the attestation and emit an event*/
    // Should we put private data in it ? we should also put timestamp in it
    const attestationHash = Poseidon.hash([
      hashRoute,
      oraclePublicKey.toFields()[0],
    ]);

    // Emit an event only if everything is valid, containing the attestation hash, the sender and the current timestamp
    // TODO add timestamp
    // concatenate the sender and the attestation hash
    const senderAndAttestationHash = Poseidon.hash([
      this.sender.toFields()[0],
      attestationHash,
    ]);
    this.emitEvent('verified', senderAndAttestationHash);
  }
}
