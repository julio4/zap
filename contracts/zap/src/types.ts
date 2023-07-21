import { PublicKey, PrivateKey, Signature, Field } from 'snarkyjs';

// Represents a key pair to sign transactions.
type KeyPair = {
  publicKey: PublicKey; // The public key of the key pair.
  privateKey: PrivateKey; // The private key of the key pair.
};

type DataObject = {
  statementId: Field;
  privateData: Field;
};

type OracleResult = {
  data: DataObject;
  signature: Signature;
  publicKey: PublicKey;
};

export type { KeyPair, OracleResult, DataObject };
