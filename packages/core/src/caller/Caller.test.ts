import { Mina, PrivateKey, PublicKey, AccountUpdate, Field } from 'o1js';
import { Caller } from './Caller';
import { Verifier } from '../verifier/Verifier';
import { ProvableStatement } from '../Statement';
import { Attestation } from '../Attestation';
import { Statement } from '@zap/types';

let proofsEnabled = false;

describe('Caller', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    userAccount: PublicKey,
    userKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Caller;

  beforeAll(async () => {
    if (proofsEnabled) {
      await Caller.compile();
    }
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: userKey, publicKey: userAccount } = Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Caller(zkAppAddress);
  });

  async function localDeployCaller() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy({
        zkappKey: zkAppPrivateKey,
      });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('deploys the `Caller` smart contract', async () => {
    await localDeployCaller();
  });

  it('can use `Caller` to call a statement verification', async () => {
    await localDeployCaller();
    // fix the source key
    const sourcePrivateKey = PrivateKey.random();
    const sourceKey = sourcePrivateKey.toPublicKey();

    // Deploy a verifier
    const verifierPrivateKey = PrivateKey.random();
    const verifierAddress = verifierPrivateKey.toPublicKey();
    const verifier = new Verifier(verifierAddress);
    const deployVerifierTxn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      verifier.deploy({
        zkappKey: verifierPrivateKey,
      });
    });
    await deployVerifierTxn.prove();
    await deployVerifierTxn.sign([deployerKey, verifierPrivateKey]).send();

    const statement: Statement = {
      sourceKey: sourceKey.toBase58(),
      route: {
        path: '/route',
        args: {},
      },
      // "target == 1"
      condition: {
        type: 3,
        targetValue: 1,
      },
    };

    const provableStatement = ProvableStatement.from(statement);
    const privateData = Field(1);
    const signature = ProvableStatement.sign(
      statement,
      privateData,
      sourcePrivateKey
    );
    const attestation = new Attestation({
      statement: provableStatement,
      privateData,
      signature,
      address: userAccount,
    });

    const txn = await Mina.transaction(userAccount, () => {
      zkApp.call(attestation, verifierAddress);
    });
    await txn.prove();
    await txn.sign([userKey]).send();
  });
});
