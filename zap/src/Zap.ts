import {
  Field,
  SmartContract,
  State,
  state,
  method,
  DeployArgs,
  Permissions,
  PublicKey,
  Signature,
  Provable,
  Bool,
  Poseidon,
} from 'o1js';

// The public key of our trusted data provider

/**
 * ZAP: Zero-knowledge Attestation Protocol
 *
 * This contract attests the validity of statements.
 * The statement are validated with data signed by a trusted data provider.
 * The contract emits an event containing the verified statement id -> it's an attestation.
 */
export class Test extends SmartContract {
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
    this.oraclePublicKey.set(PublicKey.fromBase58("B62qqrwhASBsfhEfWEsB1aRSLHFEMrKZg1Qey3KeTmD9881ekj9f9NR"));
  }

  @method verify(
    // The statement to attest
    conditionType: Field,
    targetValue: Field,
    // The private data attesting the statement from the trusted oracle
    value: Field,
    hashRoute: Field,
    // The signature that allows us to be sure that the private data are coming from our trusted oracle
    signature: Signature
  ) {

    /* VERIFICATION OF ORACLE SIGNATURE AND ROUTE: START */
    // Get the oracle public key from the contract state
    const oraclePublicKey = this.oraclePublicKey.getAndAssertEquals();

    // Evaluate whether the signature is valid for the provided data, and that the right
    // statement is being attested
    // console.log("IN SC: signature", signature);
    // console.log("IN SC: oraclePublicKey", oraclePublicKey);
    // console.log("IN SC: privateData", privateData);
    // console.log("IN SC: hashRoute", hashRoute);
    const validSignature = signature.verify(oraclePublicKey, [value, hashRoute]);

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
      value.lessThan(targetValue), // privateData < targetValue
      value.greaterThan(targetValue), // privateData > targetValue
      value.equals(targetValue), // privateData == targetValue
    ]);

    isPrivateDataValid.assertTrue();

    // STATEMENT VERIFICATION: END

    /* Generate the attestation and emit an event*/
    // todo add timestamp
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
    // TODO add timestamp
    this.emitEvent(
      'verified',
      attestationHash // todo add timestamp
    );
  }
}
