import { Bool, Field, PublicKey, Signature, method } from 'o1js';
import { Caller } from './Caller';
import { Verifier } from '../verifier/Verifier';
import { ProvableStatement } from '../Statement';
import { Attestation } from '../Attestation';
import { Statement } from '@zap/types';

// Example caller that just emit an event
export class EventCaller extends Caller {
  events = {
    verified: Field,
  };

  @method call(
    statement: ProvableStatement,
    privateData: Field,
    signature: Signature,
    verifierAddress: PublicKey
  ) {
    const verifier = new Verifier(verifierAddress);
    const isVerified: Bool = verifier.verify(
      statement,
      privateData,
      signature
    );
    isVerified.assertTrue('Statement is not verified.');

    this.emitEvent('verified', Field(42));
  }
}
