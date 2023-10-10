import { Zap } from './Zap';
import { method, PublicKey } from 'o1js';

/**
 * A mocked version of the Zap contract that can be used for testing purposes.
 * Allow to redefine the oracle public key (normally set as constant in the contract).
 */
export class MockedZap extends Zap {
  @method setOraclePublicKey(publicKey: PublicKey) {
    this.oraclePublicKey.set(publicKey);
  }
}
