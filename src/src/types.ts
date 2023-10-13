import { PublicKey, PrivateKey, Signature, Field } from 'o1js';

// Represents a key pair to sign transactions.
type KeyPair = {
  publicKey: PublicKey; // The public key of the key pair.
  privateKey: PrivateKey; // The private key of the key pair.
};

type DataOracleObject = {
  privateData: Field;
  hashRoute: Field;
};

type OracleResult = {
  data: DataOracleObject;
  signature: Signature;
  publicKey: PublicKey;
};

type Statement = {
  route: string;
  args: [] | null;
  condition: {
    /* type: 1: '<' | 2: '>' | 3: '==' | 4: '!='; */
    type: number;
    targetValue: number;
  };
};

export type { KeyPair, DataOracleObject, OracleResult, Statement };
