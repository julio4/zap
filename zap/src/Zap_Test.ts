import {
    Field,
    SmartContract,
    state,  // eslint-disable-line
    State,
    method, // eslint-disable-line
    DeployArgs,
    Permissions,
    PublicKey,
    Signature,
    Provable,
    Bool,
    Poseidon,
    UInt64,
  } from 'o1js';
  
  /**
   * ZAP: Zero-knowledge Attestation Protocol
   *
   * This contract attests the validity of statements.
   * The statement are validated with data signed by a source.
   * The contract emits an event containing the verified statement id -> it's an attestation.
   */
  export class Zap extends SmartContract {
    @state(PublicKey) oraclePublicKey = State<PublicKey>();
  
    // contract events
    events = {
      verified: Provable.Array(Field, 2),
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
  
    @method getOraclePublicKey() {
      this.oraclePublicKey.assertEquals(this.oraclePublicKey.get());
      return this.oraclePublicKey.get();
    }
  
    @method verify(
      // The statement to attest
      conditionType: Field,
      targetValue: Field,
      // The private data attesting the statement from the trusted oracle
      hashRoute: Field,
      privateData: Field,
      // The signature that allows us to be sure that the private data are coming from our trusted oracle
      signature: Signature,
      // How long the attestation is valid for, in seconds
      validFor: Field
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
      // crash if conditionType is > 3 todo handle != case
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
  
      // Attestation hash should contain information about the statement, so we can verify that this attestation corresponds to the right
      // statement
  
      let now = this.network.timestamp.get();
      this.network.globalSlotSinceGenesis.assertEquals(this.network.globalSlotSinceGenesis.get());
      let validTill = new UInt64(validFor).add(now);
  
      // TODO maybe we should hash and then sign, more secure (Birthday problem)
      const attestationHash = Poseidon.hash([
        hashRoute,
        conditionType,
        targetValue,
        this.sender.toFields()[0],
        validFor.toFields()[0],
      ]);
  
      // Emit an event only if everything is valid, containing the attestation hash and also the timestamp
      // Thus, external watchers can only see that "some proof" (but it is hashed so they don't know what statement it is) has been verified
      // at a certain time
      this.emitEvent(
        'verified',
        [attestationHash, validTill.toFields()[0]],
      );
    }
  }
  