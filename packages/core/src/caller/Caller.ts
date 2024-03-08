/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import { Bool, Field, method, PublicKey, Signature, SmartContract } from 'o1js';
import { ProvableStatement } from '../Statement.js';
import { Verifier } from '../verifier/Verifier.js';

interface ICaller {
  call(
    statement: ProvableStatement,
    privateData: Field,
    signature: Signature,
    verifierAddress: PublicKey
  ): void;
}

export class Caller extends SmartContract implements ICaller {
  @method call(
    statement: ProvableStatement,
    privateData: Field,
    signature: Signature,
    verifierAddress: PublicKey
  ): void {
    const verifier = new Verifier(verifierAddress);
    const isVerified: Bool = verifier.verify(statement, privateData, signature);
  }
}
