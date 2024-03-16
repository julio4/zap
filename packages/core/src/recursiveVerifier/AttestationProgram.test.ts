import { PrivateKey, Field, Signature } from 'o1js';
import { ProvableStatement } from '../Statement';
import { Route, StatementCondition, Statement } from '@zap/types';
import { AttestationProgram } from './AttestationProgram';

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

});
