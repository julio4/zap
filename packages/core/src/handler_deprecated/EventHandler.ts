import { Field, method } from 'o1js';
import { Handler } from './Handler';
import { Attestation } from '../Attestation';

// Example handler that just emit an event
export class EventHandler extends Handler {
  events = {
    verified: Field,
  };

  @method handle(attestation: Attestation) {
    this.emitEvent('verified', attestation.hash());
  }
}
