import { PublicKey, PrivateKey } from "o1js";

export type Statement = {
  /* in base58, @see PublicKey.toBase58 */
  sourceKey: string;
  route: string;
  /* Args are currently disabled
     We can add them in ProvableStatement in the near future
  */
  // args: any[] | null;
  condition: {
    /* type: 1: '<' | 2: '>' | 3: '==' | 4: '!='; */
    type: number;
    targetValue: number;
  };
};

export type KeyPair = {
  publicKey: PublicKey; // The public key of the key pair.
  privateKey: PrivateKey; // The private key of the key pair.
};
