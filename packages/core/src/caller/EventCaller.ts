import { Bool, Field, PublicKey, SmartContract, method } from 'o1js';
import { Caller } from './Caller';
import { Verifier } from '../verifier/Verifier.js';
import { Attestation } from '../Attestation.js';

// Example caller that just emit an event
export class EventCaller extends SmartContract implements Caller {
  events = {
    verified: Field,
  };

  @method call(attestation: Attestation, verifierAddress: PublicKey) {
    const verifier = new Verifier(verifierAddress);
    const isVerified: Bool = verifier.verify(attestation);
    isVerified.assertTrue('Attestation is not verified.');

    this.emitEvent('verified', attestation.hash());
  }
}
