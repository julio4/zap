import { Struct, Field, PublicKey } from 'o1js';

export class Source extends Struct({
  publicKey: PublicKey,
  urlApi: Field,
  name: Field,
  description: Field,
}) {
//   toFields() {
//     // TODO
//   }
}
