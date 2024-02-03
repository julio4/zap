import {
  Field,
  SmartContract,
  state, // eslint-disable-line
  State,
  method, // eslint-disable-line
  DeployArgs,
  Permissions,
  PublicKey,
  Signature,
  Provable,
  Bool,
  Poseidon,
} from 'o1js';

type Statement = {
  conditionType: Field;
  targetValue: Field;
  hashRoute: Field;
  source: PublicKey;
};

class ProvableStatement extends Struct({
  conditionType: Field,
  targetValue: Field,
  hashRoute: Field,
  source: PublicKey,
}) {
  assertValidSignature(privateData: Field, signature: Signature) {
    const validSignature = signature.verify(this.source, [
      privateData,
      this.hashRoute,
    ]);
    validSignature.assertTrue();
  }

  assertValidCondition(privateData: Field) {
    // conditionType are <: 1, >: 2, ==: 3, !=: 4
    // todo handle case 4
    this.conditionType.lessThanOrEqual(Field(3)).assertTrue();

    const whichOperator: Bool[] = [
      this.conditionType.equals(Field(1)),
      this.conditionType.equals(Field(2)),
      this.conditionType.equals(Field(3)),
    ];

    const truthValue = Provable.switch(whichOperator, Bool, [
      privateData.lessThan(this.targetValue),
      privateData.greaterThan(this.targetValue),
      privateData.equals(this.targetValue),
    ]);

    truthValue.assertTrue();
  }
}

class Attestation extends Struct({
  statement: ProvableStatement,
  address: PublicKey,
  // timestamp: Field,
}) {
  hash() {
    const { hashRoute, conditionType, targetValue, source } = this.statement;
    return Poseidon.hash([
      hashRoute,
      conditionType,
      targetValue,
    ]
    .concat(source.toFields())
    .concat(this.address.toFields()));
  }
}


/**
 * ZAP: Zero-knowledge Attestation Protocol
 *
 * This contract attests the validity of statements.
 * The statement are validated with data signed by a source.
 * The contract emits an event containing the verified statement id -> it's an attestation.
 */
export class Zap extends SmartContract {

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method verify(
    // The statement
    statement: ProvableStatement,
    // The value given to the statement variable used to verify the statement and emit the attestation
    privateData: Field,
    signature: Signature,
    // STATEMENT/ATTESTATION VERIFICATION
    statement.assertValidSignature(privateData, signature);
    statement.assertValidCondition(privateData);

    // ATTESTATION GENERATION
    const sender = this.sender;
    AccountUpdate.createSigned(sender);
    const attestation = new Attestation({
      statement,
      address: sender
    });

    // Emit an event only if everything is valid, containing the attestation hash and also the timestamp
    // Thus, external watchers can only see that "some proof" (but it is hashed so they don't know what statement it is) has been verified
    // at a certain time
    this.emitEvent(
      'verified',
      attestationHash // todo add timestamp later
    );
  }
}
