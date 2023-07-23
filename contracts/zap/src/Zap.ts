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
    privateData: Field[],
    signature: Signature
  ) {

    console.log("we are in verify in Zap contractAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    /* VERIFICATION OF ORACLE SIGNATURE AND ROUTE: START */
    // Get the oracle public key from the contract state
    const oraclePublicKey = this.oraclePublicKey.getAndAssertEquals();
    console.log("1");

    // Evaluate whether the signature is valid for the provided data, and that the right
    // statement is being attested
    // console.log("IN SC: signature", signature);
    // console.log("IN SC: oraclePublicKey", oraclePublicKey);
    // console.log("IN SC: privateData", privateData);
    // console.log("IN SC: hashRoute", hashRoute);
    const validSignature = signature.verify(oraclePublicKey, [
      privateData,
      hashRoute,
    ]);
    console.log("2");


    // Check that the signature is valid
    validSignature.assertTrue();
    /* SIGNATURE VERIFICATION: END */

    console.log("3");

    /* STATEMENT VERIFICATION: START */
    // conditionType are <: 1, >: 2, ==: 3, !=: 4
    // crash if conditionType is > 3
    conditionType.lessThanOrEqual(Field(3)).assertTrue();

    console.log("4");

    // determine which operator to use
    const whichOperator: Bool[] = [
      conditionType.equals(Field(1)),
      conditionType.equals(Field(2)),
      conditionType.equals(Field(3)),
    ];
    console.log("5");

    // verify that the privateData attest the statement
    const isPrivateDataValid = Provable.switch(whichOperator, Bool, [
      privateData.lessThan(targetValue), // privateData < targetValue
      privateData.greaterThan(targetValue), // privateData > targetValue
      privateData.equals(targetValue), // privateData == targetValue
    ]);

    console.log("6");

    isPrivateDataValid.assertTrue();

    console.log("7");

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

    console.log("8");

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
