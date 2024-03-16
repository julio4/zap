import { SelfProof, Field, ZkProgram, Signature } from 'o1js';
import { ProvableStatement } from '../Statement';

export const AttestationProgram = ZkProgram({
  name: 'AttestationAggregator',

  methods: {
    baseCase: {
      privateInputs: [ProvableStatement, Field, Signature],

      method(
        statement: ProvableStatement,
        privateData: Field,
        signature: Signature
      ) {
        statement.assertValidSignature(privateData, signature);
        statement.assertValidCondition(privateData);
      },
    },

    step: {
      privateInputs: [ProvableStatement, Field, Signature, SelfProof],
      method(
        statement: ProvableStatement,
        privateData: Field,
        signature: Signature,
        earlierProof: SelfProof<[ProvableStatement, Field, Signature], void>
      ) {
        earlierProof.verify();
        statement.assertValidCondition(privateData);
      },
    },
  },
});

export class AttestationProgramProof extends ZkProgram.Proof(
  AttestationProgram
) {}
