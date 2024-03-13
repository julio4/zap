import { Struct, Field, PublicKey, Poseidon } from 'o1js';

export class Source extends Struct({
  publicKey: PublicKey,
  urlApi: Field,
  name: Field,
  description: Field,
}) {

  static from(publicKey: PublicKey, urlApi: Field, name: Field, description: Field): Source {
    return new Source({
      publicKey,
      urlApi: urlApi,
      name: name,
      description: description,
    });
  
  }

  hash() {
    return Poseidon.hash([Poseidon.hash(this.publicKey.toFields()), this.urlApi, this.name, this.description]);
  }
}
