import { PrivateKey, Field, Signature } from 'o1js';
import { ProvableStatement } from '../Statement';
import { Attestation } from '../Attestation';
import { Route, StatementCondition, Statement } from '@zap/types';
import { AttestationProgram } from './AttestationProgram';

const createProvableStatement = (
  sourceKey: string,
  route: Route,
  condition: StatementCondition
): ProvableStatement => {
  return ProvableStatement.from({
    sourceKey,
    route,
    condition,
  });
};

describe('AttestationProgram', () => {
  const sourcePrivateKey = PrivateKey.random();
  const sourceKey58 = sourcePrivateKey.toPublicKey().toBase58();
  const statement = {
    sourceKey: sourceKey58,
    route: { path: '/test', args: {} },
    // Condition is: "value == 1"
    condition: { type: 3, targetValue: 1 },
  };
  const provableStatement = ProvableStatement.from(statement);
  const privateData = new Field(1);
  const signature = ProvableStatement.sign(
    statement,
    privateData,
    sourcePrivateKey
  );
  const attestation = new Attestation({
    statement: provableStatement,
    privateData,
    signature,
    address: sourcePrivateKey.toPublicKey(),
  });

  beforeAll(async () => {
    await AttestationProgram.compile();
  });

  it('verifies the base case correctly', async () => {
    const proof = await AttestationProgram.baseCase(attestation);
    const verificationResult = await AttestationProgram.verify(proof);
    expect(verificationResult).toBeTruthy();
  });

  it('handles the recursive step correctly (combine 2 proofs)', async () => {
    const baseProof = await AttestationProgram.baseCase(attestation);

    const secondStatement = {
      sourceKey: sourceKey58,
      route: { path: '/test2', args: {} },
      // Condition is: "value == 2"
      condition: { type: 3, targetValue: 2 },
    };
    const secondProvableStatement = ProvableStatement.from(secondStatement);
    const secondAttestation = new Attestation({
      statement: secondProvableStatement,
      privateData: new Field(2),
      signature: ProvableStatement.sign(
        secondStatement,
        Field(2),
        sourcePrivateKey
      ),
      address: sourcePrivateKey.toPublicKey(),
    });

    const stepProof = await AttestationProgram.step(
      secondAttestation,
      baseProof
    );

    const verificationResult = await AttestationProgram.verify(stepProof);
    expect(verificationResult).toBeTruthy();
  });

  it('handles the recursive step correctly, combining 10 proofs', async () => {
    let baseProof = await AttestationProgram.baseCase(attestation);

    for (let i = 2; i <= 10; i++) {
      const statement: Statement = {
        sourceKey: sourceKey58,
        route: { path: '/test', args: {} },
        condition: { type: 3, targetValue: i },
      };
      const provableStatement = ProvableStatement.from(statement);
      const newAttestation = new Attestation({
        statement: provableStatement,
        privateData: Field(i),
        signature: ProvableStatement.sign(
          statement,
          Field(i),
          sourcePrivateKey
        ),
        address: sourcePrivateKey.toPublicKey(),
      });

      baseProof = await AttestationProgram.step(newAttestation, baseProof);
    }

    const verificationResult = await AttestationProgram.verify(baseProof);
    expect(verificationResult).toBeTruthy();
  });

  it("shouldn't verify a proof if the condition is not met", async () => {
    await expect(
      AttestationProgram.baseCase(
        new Attestation({
          statement: provableStatement,
          privateData: Field(2),
          signature,
          address: sourcePrivateKey.toPublicKey(),
        })
      )
    ).rejects.toThrowError();
  });

  it("shouldn't verify a proof if sourceKey is invalid, hence invalid signature", async () => {
    const invalidSignature = ProvableStatement.sign(
      statement,
      Field(1),
      PrivateKey.random()
    );
    await expect(
      AttestationProgram.baseCase(
        new Attestation({
          statement: provableStatement,
          privateData: Field(1),
          signature: invalidSignature,
          address: sourcePrivateKey.toPublicKey(),
        })
      )
    ).rejects.toThrowError();
  });

  it("shouldn't verify a proof if random signature is used", async () => {
    const invalidSignature = Signature.create(PrivateKey.random(), [Field(1)]);
    await expect(
      AttestationProgram.baseCase(
        new Attestation({
          statement: provableStatement,
          privateData: Field(1),
          signature: invalidSignature,
          address: sourcePrivateKey.toPublicKey(),
        })
      )
    ).rejects.toThrowError();
  });
});
