import { PublicKey, PrivateKey } from 'snarkyjs';

// Represents a key pair to sign transactions.
type KeyPair = {
  publicKey: PublicKey; // The public key of the key pair.
  privateKey: PrivateKey; // The private key of the key pair.
};

export type { KeyPair };
