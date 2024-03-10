import { PrivateKey, PublicKey } from "o1js";

/* type: 1: '<' | 2: '>' | 3: '==' | 4: '!='; */
export enum ConditionType {
  LT = 1,
  GT = 2,
  EQ = 3,
  NEQ = 4,
}

export type ConditionTypeString = "<" | ">" | "==" | "!=";

const conditionTypeToStringMap: {
  [key in ConditionType]: ConditionTypeString;
} = {
  [ConditionType.LT]: "<",
  [ConditionType.GT]: ">",
  [ConditionType.EQ]: "==",
  [ConditionType.NEQ]: "!=",
};

const conditionStringToTypeMap: {
  [key in ConditionTypeString]: ConditionType;
} = {
  "<": ConditionType.LT,
  ">": ConditionType.GT,
  "==": ConditionType.EQ,
  "!=": ConditionType.NEQ,
};

export const conditionToString = (
  condition: ConditionType
): ConditionTypeString => {
  return conditionTypeToStringMap[condition];
};

export const stringToCondition = (
  condition: ConditionTypeString
): ConditionType => {
  return conditionStringToTypeMap[condition];
};

export type StatementCondition = {
  type: ConditionType;
  targetValue: number;
};

export type Route = {
  path: string;
  args?: {
    [key: string]: any;
  };
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
