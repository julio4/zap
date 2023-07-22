import { Field, PrivateKey, PublicKey, Signature } from 'snarkyjs';
import { DataObject, KeyPair, OracleResult } from '../types';
import { ethers } from 'ethers';

export class MockedOracle {
  publicKey: PublicKey;
  privateKey: PrivateKey;

  constructor(keys: KeyPair) {
    this.publicKey = keys.publicKey;
    this.privateKey = keys.privateKey;
  }

  verifyMessage = async (
    message: string,
    address: string,
    ethereumSignature: string
  ) => {
    try {
      const signerAddr = await ethers.utils.verifyMessage(
        message,
        ethereumSignature
      );

      if (signerAddr !== address) {
        return false;
      }

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  async generateStatementId(
    statementId: Field,
    lowOrHighResult: boolean, // determine the private data value
    signatureOfCaller: string,
    ethereumAddress: string
  ): Promise<OracleResult> {
    let data: DataObject;

    const isCallerSignatureValid: boolean = await this.verifyMessage(
      statementId.toString(),
      ethereumAddress,
      signatureOfCaller
    );

    if (!isCallerSignatureValid) {
      throw new Error('signature of the caller is invalid');
    }

    switch (statementId.toString()) {
      case Field(1).toString(): // getBalance
        data = {
          statementId: statementId,
          privateData: lowOrHighResult ? Field(700) : Field(500),
        };
        break;
      case Field(2).toString(): // azukiHolder
        data = {
          statementId: statementId,
          privateData: lowOrHighResult ? Field(1) : Field(0),
        };
        break;
      case Field(3).toString(): // ENS Owner
        data = {
          statementId: statementId,
          privateData: lowOrHighResult ? Field(1) : Field(0),
        };
        break;

      default:
        throw new Error('statement not found');
    }

    const signatureOfOracle: Signature = Signature.create(this.privateKey, [
      data['statementId'],
      data['privateData'],
    ]);

    const res = {
      data: data,
      signature: signatureOfOracle,
      publicKey: this.publicKey,
    };

    return res;
  }
}