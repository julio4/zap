import { Statement } from '@zap/types';
import { Bool, Encoding, Field, Poseidon, PrivateKey } from 'o1js';
import { ProvableStatement } from './Statement';

describe('ProvableStatement', () => {
  const sourcePrivateKey = PrivateKey.random();
  const sourceKey = sourcePrivateKey.toPublicKey();
  const statement: Statement = {
    sourceKey: sourceKey.toBase58(),
    route: {
      path: '/route',
      args: {},
    },
    condition: {
      type: 3,
      targetValue: 1,
    },
  };

  const provableStatement = ProvableStatement.from(statement);
  it('ProvableStatement.from(statement)', () => {
    const hashRoute = Poseidon.hash([
      ...Encoding.stringToFields(statement.route.path),
      ...Encoding.stringToFields(JSON.stringify(statement.route.args)),
    ]);
    expect(provableStatement.conditionType).toEqual(
      Field(statement.condition.type)
    );
    expect(provableStatement.targetValue).toEqual(
      Field(statement.condition.targetValue)
    );
    expect(provableStatement.source).toEqual(sourceKey);
    expect(provableStatement.hashRoute).toEqual(hashRoute);
  });

  const privateData = Field(1);
  const signature = ProvableStatement.sign(
    statement,
    privateData,
    sourcePrivateKey
  );

  it('ProvableStatement.sign(statement, privateData, privateKey)', () => {
    expect(
      signature
        .verify(sourceKey, [privateData, provableStatement.hashRoute])
        .toBoolean()
    ).toBeTruthy();

    expect(
      signature.verify(sourceKey, [privateData, Field(0)]).toBoolean()
    ).toBeFalsy();

    expect(
      signature
        .verify(sourceKey, [Field(0), provableStatement.hashRoute])
        .toBoolean()
    ).toBeFalsy();

    expect(
      signature
        .verify(PrivateKey.random().toPublicKey(), [
          privateData,
          provableStatement.hashRoute,
        ])
        .toBoolean()
    ).toBeFalsy();
  });

  describe('ProvableStatement.assertValidCondition(privateData)', () => {
    it('conditionType 1 "<"', () => {
      const ps = ProvableStatement.from({
        ...statement,
        // "target < 1"
        condition: { type: 1, targetValue: 1 },
      });
      expect(() => ps.assertValidCondition(Field(0))).not.toThrow();
      expect(() => ps.assertValidCondition(Field(1))).toThrow();
      expect(() => ps.assertValidCondition(Field(2))).toThrow();
    });
    it('throw conditionType 1 "<"', () => {
      const ps = ProvableStatement.from({
        ...statement,
        condition: { type: 1, targetValue: 1 },
      });
      expect(() => ps.assertValidCondition(Field(1))).toThrow();
    });

    it('conditionType 2 ">"', () => {
      const ps = ProvableStatement.from({
        ...statement,
        // "target > 1"
        condition: { type: 2, targetValue: 1 },
      });
      expect(() => ps.assertValidCondition(Field(2))).not.toThrow();
      expect(() => ps.assertValidCondition(Field(1))).toThrow();
      expect(() => ps.assertValidCondition(Field(0))).toThrow();
    });
    it('throw conditionType 2 ">"', () => {
      const ps = ProvableStatement.from({
        ...statement,
        condition: { type: 2, targetValue: 1 },
      });
      expect(() => ps.assertValidCondition(Field(1))).toThrow();
    });

    it('conditionType 3 "=="', () => {
      const ps = provableStatement;
      expect(() => ps.assertValidCondition(privateData)).not.toThrow();
      expect(() => ps.assertValidCondition(Field(0))).toThrow();
    });

    it('success conditionType 4 "!="', () => {
      const ps = ProvableStatement.from({
        ...statement,
        condition: { type: 4, targetValue: 1 },
      });
      expect(() => ps.assertValidCondition(Field(0))).not.toThrow();
      expect(() => ps.assertValidCondition(privateData)).toThrow();
    });
    it('throw conditionType 4 "!="', () => {
      const ps = ProvableStatement.from({
        ...statement,
        condition: { type: 4, targetValue: 1 },
      });
      expect(() => ps.assertValidCondition(privateData)).toThrow();
    });

    it('throw if conditionType > 4', () => {
      const ps = ProvableStatement.from({
        ...statement,
        // eslint-disable-next-line
        condition: { type: 5 as any, targetValue: 1 },
      });
      expect(() => ps.assertValidCondition(privateData)).toThrow();
    });
  });

  describe('ProvableStatement.isValidCondition(privateData)', () => {
    it('conditionType 1 "<"', () => {
      const ps = ProvableStatement.from({
        ...statement,
        // "target < 1"
        condition: { type: 1, targetValue: 1 },
      });
      expect(ps.isValidCondition(Field(0))).toEqual(Bool(true));
      expect(ps.isValidCondition(Field(1))).toEqual(Bool(false));
      expect(ps.isValidCondition(Field(2))).toEqual(Bool(false));
    });

    it('conditionType 2 ">"', () => {
      const ps = ProvableStatement.from({
        ...statement,
        // "target > 1"
        condition: { type: 2, targetValue: 1 },
      });
      expect(ps.isValidCondition(Field(2))).toEqual(Bool(true));
      expect(ps.isValidCondition(Field(1))).toEqual(Bool(false));
      expect(ps.isValidCondition(Field(0))).toEqual(Bool(false));
    });

    it('conditionType 3 "=="', () => {
      const ps = provableStatement;
      expect(ps.isValidCondition(privateData)).toEqual(Bool(true));
      expect(ps.isValidCondition(Field(0))).toEqual(Bool(false));
    });

    it('conditionType 4 "!="', () => {
      const ps = ProvableStatement.from({
        ...statement,
        condition: { type: 4, targetValue: 1 },
      });
      expect(ps.isValidCondition(Field(0))).toEqual(Bool(true));
      expect(ps.isValidCondition(privateData)).toEqual(Bool(false));
    });

    it('if conditionType > 4', () => {
      const ps = ProvableStatement.from({
        ...statement,
        // eslint-disable-next-line
        condition: { type: 5 as any, targetValue: 1 },
      });
      expect(ps.isValidCondition(privateData)).toEqual(Bool(false));
    });
  });
});
