import { PrivateKey, Field, PublicKey, Mina, AccountUpdate } from 'o1js';
import { ProvableStatement } from '../Statement';
import { Attestation } from '../Attestation';
import { Route, StatementCondition, Statement } from '@zap/types';
import { AttestationProgram } from './AttestationProgram';
import { RecursiveVerifier } from './RecursiveVerifier';

let proofsEnabled = false;

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
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    userAccount: PublicKey,
    userKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: RecursiveVerifier;

  const sourcePrivateKey = PrivateKey.random();
  const sourceKey58 = sourcePrivateKey.toPublicKey().toBase58();

  const statement: Statement = {
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
  let attestation: Attestation;

  beforeAll(async () => {
    if (proofsEnabled) {
      await RecursiveVerifier.compile();
    }
    await AttestationProgram.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: userKey, publicKey: userAccount } = Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new RecursiveVerifier(zkAppAddress);

    attestation = new Attestation({
      statement: provableStatement,
      privateData,
      signature,
      address: userAccount,
    });
  });

  async function localDeployRecursiveVerifier() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy({
        zkappKey: zkAppPrivateKey,
      });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('verifies the base case correctly', async () => {
    await localDeployRecursiveVerifier();
    const proof = await AttestationProgram.baseCase(attestation);
    const verificationResult = await AttestationProgram.verify(proof);
    expect(verificationResult).toBeTruthy();

    const txn = await Mina.transaction(userAccount, () => {
      zkApp.verifyProofs(proof);
    });
    await txn.prove();
    await txn.sign([userKey]).send();
  });

  it('verifies a combination of 2 proofs', async () => {
    await localDeployRecursiveVerifier();
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
      address: userAccount,
    });

    const stepProof = await AttestationProgram.step(
      secondAttestation,
      baseProof
    );

    const verificationResult = await AttestationProgram.verify(stepProof);
    expect(verificationResult).toBeTruthy();

    const txn = await Mina.transaction(userAccount, () => {
      zkApp.verifyProofs(stepProof);
    });
    await txn.prove();
    await txn.sign([userKey]).send();
  });
});
