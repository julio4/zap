import { PrivateKey, Field, Signature } from 'o1js';
import { ProvableStatement } from '../Statement';
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
  let sourcePrivateKey: PrivateKey,
    sourceKey58: string,
    statement: Statement,
    provableStatement: ProvableStatement,
    signature: Signature;

  beforeAll(async () => {
    await AttestationProgram.compile();
    sourcePrivateKey = PrivateKey.random();
    sourceKey58 = sourcePrivateKey.toPublicKey().toBase58();
  });

  beforeEach(() => {
    statement = {
      sourceKey: sourceKey58,
      route: { path: '/test', args: {} },
      // Condition is: "value == 1"
      condition: { type: 3, targetValue: 1 },
    };

    provableStatement = ProvableStatement.from(statement);
    const privateData = new Field(1);
    signature = ProvableStatement.sign(
      statement,
      privateData,
      sourcePrivateKey
    );
  });

  it('verifies the base case correctly', async () => {
    const privateData = new Field(1);
    const proof = await AttestationProgram.baseCase(
      provableStatement,
      privateData,
      signature
    );
    const verificationResult = await AttestationProgram.verify(proof);
    expect(verificationResult).toBeTruthy();
  });

  it('handles the recursive step correctly (combine 2 proofs)', async () => {
    const privateData = new Field(1);
    const baseProof = await AttestationProgram.baseCase(
      provableStatement,
      privateData,
      signature
    );

    const secondProvableStatement = createProvableStatement(
      sourceKey58,
      { path: '/test2', args: {} },
      { type: 3, targetValue: 2 } // Condition is: "value == 2"
    );
    const stepProof = await AttestationProgram.step(
      secondProvableStatement,
      Field(2),
      signature,
      baseProof
    );
    const verificationResult = await AttestationProgram.verify(stepProof);
    expect(verificationResult).toBeTruthy();
  });

  it('handles the recursive step correctly, combining 10 proofs', async () => {
    const privateData = new Field(1);
    let baseProof = await AttestationProgram.baseCase(
      provableStatement,
      privateData,
      signature
    );

    for (let i = 2; i <= 10; i++) {
      const provableStatement = createProvableStatement(
        sourceKey58,
        { path: '/test', args: {} },
        { type: 3, targetValue: i }
      );
      baseProof = await AttestationProgram.step(
        provableStatement,
        Field(i),
        signature,
        baseProof
      );
    }

    const verificationResult = await AttestationProgram.verify(baseProof);
    expect(verificationResult).toBeTruthy();

  });

  it("shouldn't verify a proof if the condition is not met", async () => {
    await expect(
      AttestationProgram.baseCase(
        provableStatement,
        Field(2), // Should be Field(1) to pass
        signature
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
      AttestationProgram.baseCase(provableStatement, Field(1), invalidSignature)
    ).rejects.toThrowError();
  });

  it("shouldn't verify a proof if random signature is used", async () => {
    const invalidSignature = Signature.create(PrivateKey.random(), [Field(1)]);
    await expect(
      AttestationProgram.baseCase(provableStatement, Field(1), invalidSignature)
    ).rejects.toThrowError();
  });
});
