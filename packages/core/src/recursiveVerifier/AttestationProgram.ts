import { SelfProof, Field, ZkProgram, Signature } from 'o1js';
import { ProvableStatement } from '../Statement';
import { Attestation } from '../Attestation';

export const AttestationProgram = ZkProgram({
  name: 'AttestationAggregator',

  methods: {
    baseCase: {
      privateInputs: [Attestation],

      method(attestation: Attestation) {
        attestation.assertValid();
      },
    },

    step: {
      privateInputs: [Attestation, SelfProof],
      method(
        attestation: Attestation,
        earlierProof: SelfProof<[ProvableStatement, Field, Signature], void>
      ) {
        earlierProof.verify();
        attestation.assertValid();
      },
    },
  },
});

export class AttestationProgramProof extends ZkProgram.Proof(
  AttestationProgram
) {}
