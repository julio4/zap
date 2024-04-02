import { PrivateKey } from 'o1js';

const pk = PrivateKey.random();
console.log('Public key:', pk.toPublicKey().toBase58());
console.log('Private key:', pk.toBase58());
