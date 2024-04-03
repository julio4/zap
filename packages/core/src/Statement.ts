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
import { Route, Statement } from '@zap/types';

export const hashRoute = (route: Route): Field =>
  Poseidon.hash([
    ...Encoding.stringToFields(route.path),
    ...Encoding.stringToFields(JSON.stringify(route.args)),
  ]);

interface IProvableStatement {
  isValidCondition(privateData: Field): Bool;
  assertValidCondition(privateData: Field): void;
}

export class ProvableStatement
  extends Struct({
    conditionType: Field,
    targetValue: Field,
    hashRoute: Field,
    source: PublicKey,
  })
  implements IProvableStatement
{
  static from(statement: Statement): ProvableStatement {
    return new ProvableStatement({
      conditionType: Field(statement.condition.type),
      targetValue: Field(statement.condition.targetValue),
      hashRoute: hashRoute(statement.route),
      source: PublicKey.fromBase58(statement.sourceKey),
    });
  }

  // Generate a signature that the privateData was emitted by the given keys for this statement
  static sign(
    statement: Statement,
    privateData: Field,
    privateKey: PrivateKey
  ): Signature {
    return Signature.create(privateKey, [
      privateData,
      hashRoute(statement.route),
    ]);
  }

  isValidCondition(privateData: Field): Bool {
    // see types/ConditionType
    // conditionType are <: 1, >: 2, ==: 3, !=: 4
    const whichOperator: Bool[] = [
      this.conditionType.equals(Field(1)),
      this.conditionType.equals(Field(2)),
      this.conditionType.equals(Field(3)),
      this.conditionType.equals(Field(4)),
    ];

    return Provable.switch(whichOperator, Bool, [
      privateData.lessThan(this.targetValue),
      privateData.greaterThan(this.targetValue),
      privateData.equals(this.targetValue),
      privateData
        .greaterThan(this.targetValue)
        .or(privateData.lessThan(this.targetValue)),
    ]);
  }

  assertValidCondition(privateData: Field) {
    // see types/ConditionType
    // conditionType are <: 1, >: 2, ==: 3, !=: 4
    this.conditionType.lessThanOrEqual(Field(4)).assertTrue();
    this.isValidCondition(privateData).assertTrue();
  }
}
