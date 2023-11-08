import { Field, Poseidon, PrivateKey, PublicKey, Signature } from 'o1js';
import { DataOracleObject, KeyPair, OracleResult } from '../types';
import { ethers } from 'ethers';
import { stringToFields } from 'o1js/dist/node/bindings/lib/encoding';

const normalizeAddress = (address: string) => {
  return ethers.utils.getAddress(address);
};

export class MockedOracle {
  publicKey: PublicKey;
  privateKey: PrivateKey;

  constructor(keys: KeyPair) {
    this.publicKey = keys.publicKey;
    this.privateKey = keys.privateKey;
  }

  /* Verify that the message comes from the right address */
  checkMessageSigner = async (
    message: string,
    address: string,
    ethereumSignature: string
  ) => {
    try {
      const signerAddr = await ethers.utils.verifyMessage(
        `I am ${normalizeAddress(address)}`,
        ethereumSignature
      );

      if (normalizeAddress(signerAddr) !== normalizeAddress(address)) {
        return false;
      }

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  /* Generate a statement for a given ApiRequestId */
  async generateStatement(
    ApiRequestId: Field,
    lowOrHighResult: boolean, // Mock parameter, to determine the private data value
    signatureOfCaller: string,
    ethereumAddress: string
  ): Promise<OracleResult> {
    let data: DataOracleObject;

    const isCallerSignatureValid: boolean = await this.checkMessageSigner(
      ApiRequestId.toString(), // TODO: Why is it the ApiRequestId? need to check flow
      ethereumAddress,
      signatureOfCaller
    );
    if (!isCallerSignatureValid) {
      throw new Error('signature of the caller is invalid');
    }

    const routeString = JSON.stringify({
      //todo clean
      route: '/balance',
      args: { token: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' },
    });

    /* Generating the statement */
    switch (ApiRequestId.toString()) {
      case Field(1).toString(): // getBalance
        data = {
          hashRoute: Poseidon.hash([stringToFields(routeString)[0]]),
          privateData: Field(375),
        };
        break;
      case Field(2).toString(): // azukiHolder
        data = {
          hashRoute: Poseidon.hash([
            stringToFields(
              '/balance/:0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'
            )[0],
          ]),
          privateData: lowOrHighResult ? Field(1) : Field(0),
        };
        break;
      case Field(3).toString(): // ENS Owner
        data = {
          hashRoute: Poseidon.hash([
            stringToFields(
              '/balance/:0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'
            )[0],
          ]),
          privateData: lowOrHighResult ? Field(1) : Field(0),
        };
        break;

      default:
        throw new Error('statement not found');
    }

    /* Oracle needs to sign the statement to prove that he is the one who generated it */
    const signatureOfOracle: Signature = Signature.create(this.privateKey, [
      data.privateData,
      data.hashRoute,
    ]);

    const res = {
      data: data,
      signature: signatureOfOracle,
      publicKey: this.publicKey,
    };

    return res;
  }
}
