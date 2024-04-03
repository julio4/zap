import { Struct, Poseidon, PublicKey, Field, Signature, Bool } from 'o1js';
import { ProvableStatement } from './Statement.js';

interface IAttestation {
  // Return the attestation Poseidon hash
  hash(): Field;
  // Assert that the given hash is equal to the attestation hash
  assertEqual(hash: Field): void;
  // Check if the signature is valid
  isValidSignature(): Bool;
  // Assert that the signature is valid
  assertValidSignature(): void;
  // Check if the condition is valid
  isValidCondition: () => Bool;
  // Assert that the condition is valid
  assertValidCondition: () => void;
  // Check if the attestation is valid (signature and condition)
  isValid(): Bool;
  // Assert that the attestation is valid (signature and condition)
  assertValid(): void;
}

export class Attestation
  extends Struct({
    statement: ProvableStatement,
    privateData: Field,
    signature: Signature,
    address: PublicKey,
  })
  implements IAttestation
{
  // TODO: check if we need to add privateData as well
  // if not: do we also really need to add the address?
  // if not: move this function to ProvableStatement and return this.statement.hash()
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

  isValidSignature(): Bool {
    return this.signature.verify(this.statement.source, [
      this.privateData,
      this.statement.hashRoute,
    ]);
  }

  assertValidSignature() {
    return this.isValidSignature().assertTrue();
  }

  isValidCondition(): Bool {
    return this.statement.isValidCondition(this.privateData);
  }

  assertValidCondition() {
    this.statement.assertValidCondition(this.privateData);
  }

  isValid(): Bool {
    return this.isValidSignature().and(this.isValidCondition());
  }

  assertValid() {
    this.isValid().assertTrue();
  }
}
