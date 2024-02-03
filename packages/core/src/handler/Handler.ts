import { method, SmartContract } from 'o1js';
import { Attestation } from '../Attestation';

interface IHandler {
  handle(attestation: Attestation): void;
}

export class Handler extends SmartContract implements IHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  @method handle(_attestation: Attestation) {}
}
