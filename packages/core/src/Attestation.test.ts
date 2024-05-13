import { Statement, ConditionType } from '@zap/types';
import { Attestation } from './Attestation';
import { ProvableStatement } from './Statement';
import { Bool, Field, Poseidon, PrivateKey, Signature } from 'o1js';

describe('Attestation', () => {
  const sourcePrivateKey = PrivateKey.random();
  const sourceKey = sourcePrivateKey.toPublicKey();
  const address = PrivateKey.random().toPublicKey();
  const statement: Statement = {
    sourceKey: sourceKey.toBase58(),
    route: {
      path: '/route',
      args: {},
    },
    condition: {
      type: ConditionType.EQ,
      targetValue: 1,
    },
  };
  const privateData = Field(1);

  const attestation = new Attestation({
    statement: ProvableStatement.from(statement),
    privateData,
    signature: ProvableStatement.sign(statement, privateData, sourcePrivateKey),
    address,
  });

  it('Attestation.address', () => {
    expect(attestation.address).toEqual(address);
  });

  it('Attestation.statement', () => {
    const provableStatement = ProvableStatement.from(statement);
    expect(attestation.statement).toEqual(provableStatement);
  });

  it('Attestation.privateData', () => {
    expect(attestation.privateData).toEqual(privateData);
  });

  it('Attestation.hash()', () => {
    const { hashRoute, conditionType, targetValue, source } =
      attestation.statement;
    const message = [
      hashRoute,
      conditionType,
      targetValue,
      ...source.toFields(),
      ...address.toFields(),
    ];
    const digest = Poseidon.hash(message);
    expect(attestation.hash()).toEqual(digest);
  });

  it('Attestation.assertEqual()', () => {
    const hash = attestation.hash();
    expect(() => attestation.assertEqual(hash)).not.toThrow();
    expect(() =>
      attestation.assertEqual(Poseidon.hash([Field(0x1)]))
    ).toThrow();
  });

  it('Attestation.assertValidSignature()', () => {
    expect(() => attestation.assertValidSignature()).not.toThrow();

    expect(() =>
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData: Field(0),
        signature: ProvableStatement.sign(
          statement,
          privateData,
          sourcePrivateKey
        ),
        address,
      }).assertValidSignature()
    ).toThrow();

    expect(() =>
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData,
        signature: ProvableStatement.sign(
          statement,
          privateData,
          PrivateKey.random()
        ),
        address,
      }).assertValidSignature()
    ).toThrow();

    expect(() =>
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData,
        signature: Signature.create(sourcePrivateKey, [privateData, Field(0)]),
        address,
      }).assertValidSignature()
    ).toThrow();

    expect(() =>
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData,
        signature: Signature.create(sourcePrivateKey, [
          Field(0),
          attestation.statement.hashRoute,
        ]),
        address,
      }).assertValidSignature()
    ).toThrow();
  });

  it('Attestation.isValidSignature()', () => {
    expect(attestation.isValidSignature()).toEqual(Bool(true));

    expect(
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData: Field(0),
        signature: ProvableStatement.sign(
          statement,
          privateData,
          sourcePrivateKey
        ),
        address,
      }).isValidSignature()
    ).toEqual(Bool(false));

    expect(
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData,
        signature: ProvableStatement.sign(
          statement,
          privateData,
          PrivateKey.random()
        ),
        address,
      }).isValidSignature()
    ).toEqual(Bool(false));

    expect(
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData,
        signature: Signature.create(sourcePrivateKey, [privateData, Field(0)]),
        address,
      }).isValidSignature()
    ).toEqual(Bool(false));

    expect(
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData,
        signature: Signature.create(sourcePrivateKey, [
          Field(0),
          attestation.statement.hashRoute,
        ]),
        address,
      }).isValidSignature()
    ).toEqual(Bool(false));
  });

  it('Attestation.assertValidCondition()', () => {
    expect(() => attestation.assertValidCondition()).not.toThrow();

    expect(() =>
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData: Field(0),
        signature: ProvableStatement.sign(
          statement,
          Field(0),
          sourcePrivateKey
        ),
        address,
      }).assertValidCondition()
    ).toThrow();

    expect(() =>
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData: Field(2),
        signature: ProvableStatement.sign(
          statement,
          Field(2),
          sourcePrivateKey
        ),
        address,
      }).assertValidCondition()
    ).toThrow();
  });

  it('Attestation.isValidCondition()', () => {
    expect(attestation.isValidCondition()).toEqual(Bool(true));

    expect(
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData: Field(0),
        signature: ProvableStatement.sign(
          statement,
          Field(0),
          sourcePrivateKey
        ),
        address,
      }).isValidCondition()
    ).toEqual(Bool(false));

    expect(
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData: Field(2),
        signature: ProvableStatement.sign(
          statement,
          Field(2),
          sourcePrivateKey
        ),
        address,
      }).isValidCondition()
    ).toEqual(Bool(false));
  });

  it('Attestation.assertValid()', () => {
    expect(() => attestation.assertValid()).not.toThrow();

    expect(() =>
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData: Field(0),
        signature: ProvableStatement.sign(
          statement,
          Field(0),
          sourcePrivateKey
        ),
        address,
      }).assertValid()
    ).toThrow();

    expect(() =>
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData: Field(2),
        signature: ProvableStatement.sign(
          statement,
          Field(2),
          sourcePrivateKey
        ),
        address,
      }).assertValid()
    ).toThrow();
  });

  it('Attestation.isValid()', () => {
    expect(attestation.isValid()).toEqual(Bool(true));

    expect(
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData: Field(0),
        signature: ProvableStatement.sign(
          statement,
          Field(0),
          sourcePrivateKey
        ),
        address,
      }).isValid()
    ).toEqual(Bool(false));

    expect(
      new Attestation({
        statement: ProvableStatement.from(statement),
        privateData: Field(2),
        signature: ProvableStatement.sign(
          statement,
          Field(2),
          sourcePrivateKey
        ),
        address,
      }).isValid()
    ).toEqual(Bool(false));
  });
});
