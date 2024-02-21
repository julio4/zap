import { ConditionType } from "./core.js";

export type MinaWallet = {
  isConnected: boolean;
  address: string;
};

export type AttestationNote = {
  attestationHash: string;
  statement: string;
  targetValue: number;
  conditionType: ConditionType;
  hashRoute: string;
  sender: string;
};
