import { Field, Provable, PublicKey, Signature, Struct, Bool, Poseidon, Encoding } from 'o1js';
import { Statement } from "@zap/types";

export class ProvableStatement extends Struct({
  conditionType: Field,
  targetValue: Field,
  hashRoute: Field,
  source: PublicKey,
}) {
  static from(statement: Statement): ProvableStatement {
    return new ProvableStatement({
      conditionType: Field(statement.condition.type),
      targetValue: Field(statement.condition.targetValue),
      hashRoute: Poseidon.hash(Encoding.stringToFields(statement.route)),
      source: PublicKey.fromBase58(statement.sourceKey),
    });
  }

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
