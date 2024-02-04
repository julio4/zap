import { Struct, Poseidon, PublicKey } from 'o1js';
import { ProvableStatement } from './Statement';

export class Attestation extends Struct({
  statement: ProvableStatement,
  address: PublicKey,
  // timestamp: Field,
}) {
  hash() {
    const { hashRoute, conditionType, targetValue, source } = this.statement;
    return Poseidon.hash(
      [hashRoute, conditionType, targetValue]
        .concat(source.toFields())
        .concat(this.address.toFields())
    );
  }
}
