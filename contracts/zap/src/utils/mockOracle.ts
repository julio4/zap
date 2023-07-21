import { Field, PrivateKey, PublicKey, Signature } from 'snarkyjs';
import { DataObject, KeyPair, OracleResult } from '../types';

export class MockedOracle {
  publicKey: PublicKey;
  privateKey: PrivateKey;

  constructor(keys: KeyPair) {
    this.publicKey = keys.publicKey;
    this.privateKey = keys.privateKey;
  }

  async generateStatementId(
    statementId: Field,
    lowOrHighResult: boolean // determine the private data valu
    //   signatureOfCaller: Signature
  ): Promise<OracleResult> {
    let data: DataObject;

    switch (statementId.value[0]) {
      case Field(1).value[0]: // getBalance
        data = {
          statementId: statementId,
          privateData: lowOrHighResult ? Field(700) : Field(500),
        };
        break;
      case Field(2).value[0]: // azukiHolder
        data = {
          statementId: statementId,
          privateData: lowOrHighResult ? Field(1) : Field(0),
        };
        break;
      case Field(3).value[0]: // ENS Owner
        data = {
          statementId: statementId,
          privateData: lowOrHighResult ? Field(1) : Field(0),
        };
        break;

      default:
        throw new Error('statement not found');
    }

    const signature: Signature = Signature.create(this.privateKey, [
      data['statementId'],
      data['privateData'],
    ]);

    const res = {
      data: data,
      signature: signature,
      publicKey: this.publicKey,
    };

    return res;
  }
}