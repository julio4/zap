import { PrivateKey } from 'o1js';

const generate = (): PrivateKey => PrivateKey.random();

const key = generate();
console.log('PRIVATE KEY: ', key.toBase58());
console.log('PUBLIC KEY:  ', key.toPublicKey().toBase58());
