import { Statement, ConditionType } from '@zap/types';
import { ProvableStatement } from '../Statement';
import { Verifier } from './Verifier';
import { Attestation } from '../Attestation';

import { Mina, PrivateKey, PublicKey, AccountUpdate, Field } from 'o1js';
import { TestPublicKey } from 'o1js/dist/node/lib/mina/local-blockchain';

let proofsEnabled = false;

describe('Verifier', () => {
  let deployer: TestPublicKey,
    user: TestPublicKey,
    verifierAddress: PublicKey,
    verifierPrivateKey: PrivateKey,
    verifier: Verifier;

  const sourcePrivateKey = PrivateKey.random();
  const sourceKey = sourcePrivateKey.toPublicKey();
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

  beforeAll(async () => {
    if (proofsEnabled) {
      await Verifier.compile();
    }
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    deployer = Local.testAccounts[0];
    user = Local.testAccounts[1];
    verifierPrivateKey = PrivateKey.random();
    verifierAddress = verifierPrivateKey.toPublicKey();
    verifier = new Verifier(verifierAddress);
  });

  async function localDeployVerifier() {
    const txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      verifier.deploy();
    });
    await txn.prove();
    await txn.sign([deployer.key, verifierPrivateKey]).send();
  }

  it('deploys the `Verifier` smart contract', async () => {
    await localDeployVerifier();
  });

  it('verify an attestation', async () => {
    await localDeployVerifier();

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
      address: user,
    });

    const isVerified = await verifier.verify(attestation);
    expect(isVerified.toBoolean()).toBeTruthy();

    // const attestation = new Attestation({
    //   statement: provableStatement,
    //   address: userAccount,
    // });
    // const expectedDataInEvent = attestation.hash();
    // const eventsFetched = await handler.fetchEvents();
    // const dataInEventFetched = eventsFetched[0].event.data;
    // expect(eventsFetched[0].type).toEqual('verified');
    // expect(dataInEventFetched).toEqual(expectedDataInEvent);
  });

  it("should throw an error if the statement's signature is invalid", async () => {
    await localDeployVerifier();

    const provableStatement = ProvableStatement.from(statement);
    const privateData = new Field(1);
    const signature = ProvableStatement.sign(
      statement,
      privateData,
      sourcePrivateKey
    );
    signature.r = Field.random();

    const attestation = new Attestation({
      statement: provableStatement,
      privateData,
      signature,
      address: user,
    });

    const isVerified = await verifier.verify(attestation);
    expect(isVerified.toBoolean()).toBeFalsy();
  });

  it('should throw an error if the statement condition is invalid', async () => {
    await localDeployVerifier();

    const provableStatement = ProvableStatement.from(statement);
    const privateData = new Field(0);
    const signature = ProvableStatement.sign(
      statement,
      privateData,
      sourcePrivateKey
    );
    const attestation = new Attestation({
      statement: provableStatement,
      privateData,
      signature,
      address: user,
    });

    const isVerified = await verifier.verify(attestation);
    expect(isVerified.toBoolean()).toBeFalsy();
  });
});
