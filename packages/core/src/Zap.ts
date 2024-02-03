import {
  Field,
  SmartContract,
  method, // eslint-disable-line
  DeployArgs,
  Permissions,
  PublicKey,
  Signature,
  Provable,
  Bool,
  Poseidon,
  Struct,
  AccountUpdate,
} from 'o1js';

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
    return Poseidon.hash(
      [hashRoute, conditionType, targetValue]
        .concat(source.toFields())
        .concat(this.address.toFields())
    );
  }
}

interface IHandler {
  handle(attestation: Attestation): void;
}

// Example handler that just emit an event
export class Handler extends SmartContract implements IHandler {
  events = {
    verified: Field,
  };

  @method handle(attestation: Attestation) {
    this.emitEvent('verified', attestation.hash());
  }
}

interface IZap {
  verify(
    // The statement
    statement: ProvableStatement,
    // The value given to the statement variable used to verify the statement and emit the attestation
    privateData: Field,
    signature: Signature,
    // Handler (contract that implements IHandler)
    handler: PublicKey
  ): Bool;
}

/**
 * ZAP: Zero-knowledge Attestation Protocol
 *
 * This contract attests the validity of statements.
 * The statement are validated with data signed by a source.
 * The contract emits an event containing the verified statement id -> it's an attestation.
 */
export class Zap extends SmartContract implements IZap {
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
    signature: Signature,
    handler: PublicKey
  ): Bool {
    // STATEMENT/ATTESTATION VERIFICATION
    statement.assertValidSignature(privateData, signature);
    statement.assertValidCondition(privateData);

    // ATTESTATION GENERATION
    const sender = this.sender;
    AccountUpdate.createSigned(sender);
    const attestation = new Attestation({
      statement,
      address: sender,
    });

    // ATTESTATION HANDLING
    const handlerContract = new Handler(handler);
    handlerContract.handle(attestation);

    // Calling contract can further handle the attestation if needed
    return Bool(true);
  }
}
