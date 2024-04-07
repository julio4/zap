/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
import { Bool, method, PublicKey, SmartContract } from 'o1js';
import { Attestation } from '../Attestation.js';
import { Verifier } from '../verifier/Verifier.js';

interface ICaller {
  call(attestation: Attestation, verifierAddress: PublicKey): void;
}

export class Caller extends SmartContract implements ICaller {
  @method call(attestation: Attestation, verifierAddress: PublicKey): void {
    const verifier = new Verifier(verifierAddress);
    const isVerified: Bool = verifier.verify(attestation);
    isVerified.assertTrue();
  }
}
