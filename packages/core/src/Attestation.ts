import { Struct, Poseidon, PublicKey, Field } from 'o1js';
import { ProvableStatement } from './Statement';

export class Attestation extends Struct({
  statement: ProvableStatement,
  address: PublicKey,
  // timestamp: Field,
}) {
  hash(): Field {
    const { hashRoute, conditionType, targetValue, source } = this.statement;
    return Poseidon.hash([
      hashRoute,
      conditionType,
      targetValue,
      ...source.toFields(),
      ...this.address.toFields(),
    ]);
  }

  assertEqual(hash: Field) {
    this.hash().assertEquals(hash, 'Attestation hash does not match.');
  }

  // Todo later
  // assertValid(at_timestamp
}
