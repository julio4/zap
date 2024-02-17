import { PrivateKey, PublicKey } from "o1js";
import { Route } from "./index.js";

/* type: 1: '<' | 2: '>' | 3: '==' | 4: '!='; */
export enum ConditionType {
  LT = 1,
  GT = 2,
  EQ = 3,
  NEQ = 4,
}

export type ConditionTypeString = "<" | ">" | "==" | "!=";

export type StatementCondition = {
  type: ConditionType;
  targetValue: number;
};

export type Statement = {
  /* in base58, @see PublicKey.toBase58 */
  sourceKey: string;
  route: Route;
  condition: StatementCondition;
};

export type KeyPair = {
  publicKey: PublicKey; // The public key of the key pair.
  privateKey: PrivateKey; // The private key of the key pair.
};
