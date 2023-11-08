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
} from 'o1js';

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

  @method setOraclePublicKey(publicKey: PublicKey) {
    this.oraclePublicKey.set(publicKey);
  }

  @method verify(
    // The statement to attest
    conditionType: Field,
    targetValue: Field,
    // The private data attesting the statement from the trusted oracle
    hashRoute: Field,
    privateData: Field,
    // The signature that allows us to be sure that the private data are coming from our trusted oracle
    signature: Signature
  ) {

    /* VERIFICATION OF ORACLE SIGNATURE AND ROUTE: START */
    // Get the oracle public key from the contract state
    const oraclePublicKey = this.oraclePublicKey.getAndAssertEquals();

    // Evaluate whether the signature is valid for the provided data, and that the right
    // statement is being attested
    const validSignature = signature.verify(oraclePublicKey, [
      privateData,
      hashRoute,
    ]);

    // Check that the signature is valid
    validSignature.assertTrue();
    /* SIGNATURE VERIFICATION: END */

    /* STATEMENT VERIFICATION: START */
    // conditionType are <: 1, >: 2, ==: 3, !=: 4
    // crash if conditionType is > 3
    conditionType.lessThanOrEqual(Field(3)).assertTrue();

    // determine which operator to use
    const whichOperator: Bool[] = [
      conditionType.equals(Field(1)),
      conditionType.equals(Field(2)),
      conditionType.equals(Field(3)),
    ];

    // verify that the privateData attest the statement
    const isPrivateDataValid = Provable.switch(whichOperator, Bool, [
      privateData.lessThan(targetValue), // privateData < targetValue
      privateData.greaterThan(targetValue), // privateData > targetValue
      privateData.equals(targetValue), // privateData == targetValue
    ]);

    isPrivateDataValid.assertTrue();

    // STATEMENT VERIFICATION: END

    /* Generate the attestation and emit an event*/
    // todo add timestamp later
    // Attestation hash should contain information about the statement, so we can verify that this attestation corresponds to the right
    // statement

    // TODO maybe we should hash and then sign, more secure (Birthday problem)
    const attestationHash = Poseidon.hash([
      hashRoute,
      conditionType,
      targetValue,
      this.sender.toFields()[0],
      //timestamp
    ]);

    // Emit an event only if everything is valid, containing the attestation hash and also the timestamp
    // Thus, external watchers can only see that "some proof" (but it is hashed so they don't know what statement it is) has been verified
    // at a certain time
    this.emitEvent(
      'verified',
      attestationHash // todo add timestamp later
    );
  }
}
