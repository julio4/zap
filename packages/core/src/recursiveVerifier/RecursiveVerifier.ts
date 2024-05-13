import { SmartContract, method } from 'o1js';
import { AttestationProgramProof } from './AttestationProgram';

export class RecursiveVerifier extends SmartContract {
  init() {
    super.init();
  }

  @method async verifyProofs(attestationProgramProof: AttestationProgramProof) {
    attestationProgramProof.verify();
  }
}
