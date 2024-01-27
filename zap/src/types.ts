import { PublicKey, PrivateKey, Signature, Field } from 'o1js';

// Represents a key pair to sign transactions.
type KeyPair = {
  publicKey: PublicKey; // The public key of the key pair.
  privateKey: PrivateKey; // The private key of the key pair.
};

type DataOracleObject = {
  privateData: Field; // The private data attesting the statement, it is coming from the trusted oracle
  hashRoute: Field; // The hash of the route corresponding to the statement
};

type OracleResult = {
  data: DataOracleObject; // The data attesting the statement from the trusted oracle
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
