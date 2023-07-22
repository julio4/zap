import { Field, Poseidon, PrivateKey, PublicKey, Signature } from 'snarkyjs';
import { DataOracleObject, KeyPair, OracleResult } from '../types';
import { ethers } from 'ethers';
import { stringToFields } from 'snarkyjs/dist/node/bindings/lib/encoding';

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
    let data: DataOracleObject;

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
          hashRoute: Poseidon.hash([
            stringToFields(
              '/balance/:0xdac17f958d2ee523a2206206994597c13d831ec7'
            )[0],
          ]),
          privateData: lowOrHighResult ? Field(700) : Field(500),
        };
        break;
      case Field(2).toString(): // azukiHolder
      // TODO also string to fields here
        data = {
          hashRoute: Poseidon.hash([
            Field('/balance/:0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'),
          ]),
          privateData: lowOrHighResult ? Field(1) : Field(0),
        };
        break;
      case Field(3).toString(): // ENS Owner
        data = {
          hashRoute: Poseidon.hash([
            Field('/ens/:0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'),
          ]),
          privateData: lowOrHighResult ? Field(1) : Field(0),
        };
        break;

      default:
        throw new Error('statement not found');
    }

    const signatureOfOracle: Signature = Signature.create(this.privateKey, [
      data['hashRoute'],
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
