/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import { Field, method, PublicKey, Signature, SmartContract } from 'o1js';
import { ProvableStatement } from './Statement.js';

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
  ): void {}
}
