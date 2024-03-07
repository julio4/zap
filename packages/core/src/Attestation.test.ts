import { Statement } from '@zap/types';
import { Attestation } from './Attestation';
import { ProvableStatement } from './Statement';
import { Field, Poseidon, PrivateKey } from 'o1js';

describe('Attestation', () => {
  const sourceKey = PrivateKey.random().toPublicKey();
  const address = PrivateKey.random().toPublicKey();
  const statement: Statement = {
    sourceKey: sourceKey.toBase58(),
    route: {
      path: '/route',
      args: {},
    },
    condition: {
      type: 1,
      targetValue: 1,
    },
  };
  const attestation = new Attestation({
    statement: ProvableStatement.from(statement),
    address,
  });

  it('address', () => {
    expect(attestation.address).toEqual(address);
  });

  it('statement', () => {
    const provableStatement = ProvableStatement.from(statement);
    expect(attestation.statement).toEqual(provableStatement);
  });

  it('hash()', () => {
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

  it('assertEqual()', () => {
    const hash = attestation.hash();
    expect(() => attestation.assertEqual(hash)).not.toThrow();
    expect(() =>
      attestation.assertEqual(Poseidon.hash([Field(0x1)]))
    ).toThrow();
  });
});
