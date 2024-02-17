import {
  Field,
  Provable,
  PublicKey,
  Signature,
  Struct,
  Bool,
  Poseidon,
  Encoding,
  PrivateKey,
} from 'o1js';
import { Statement } from '@zap/types';

export class ProvableStatement extends Struct({
  conditionType: Field,
  targetValue: Field,
  hashRoute: Field,
  source: PublicKey,
}) {
  // TODO? Maybe move this elsewhere
  private static hashRoute(statement: Statement): Field {
    return Poseidon.hash([
      ...Encoding.stringToFields(statement.route.path),
      ...Encoding.stringToFields(JSON.stringify(statement.route.args)),
    ]);
  }

  static from(statement: Statement): ProvableStatement {
    return new ProvableStatement({
      conditionType: Field(statement.condition.type),
      targetValue: Field(statement.condition.targetValue),
      hashRoute: this.hashRoute(statement),
      source: PublicKey.fromBase58(statement.sourceKey),
    });
  }

  static sign(
    statement: Statement,
    privateData: Field,
    privateKey: PrivateKey
  ): Signature {
    return Signature.create(privateKey, [
      privateData,
      this.hashRoute(statement),
    ]);
  }

  assertValidSignature(privateData: Field, signature: Signature) {
    const validSignature = signature.verify(this.source, [
      privateData,
      this.hashRoute,
    ]);
    validSignature.assertTrue();
  }

  assertValidCondition(privateData: Field) {
    // see types/ConditionType
    // conditionType are <: 1, >: 2, ==: 3, !=: 4
    this.conditionType.lessThanOrEqual(Field(4)).assertTrue();

    const whichOperator: Bool[] = [
      this.conditionType.equals(Field(1)),
      this.conditionType.equals(Field(2)),
      this.conditionType.equals(Field(3)),
      this.conditionType.equals(Field(4)),
    ];

    const truthValue = Provable.switch(whichOperator, Bool, [
      privateData.lessThan(this.targetValue),
      privateData.greaterThan(this.targetValue),
      privateData.equals(this.targetValue),
      privateData
        .greaterThan(this.targetValue)
        .or(privateData.lessThan(this.targetValue)),
    ]);

    truthValue.assertTrue();
  }
}
