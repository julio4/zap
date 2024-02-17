import { StatementCondition } from "./core.js";

// type Route de ./source.ts ?
type SourceRequest = {
  route: string; // enum but dependent on source
  args: { [key: string]: any };
};

export type ClientStatement = {
  // TODO merge with Statement?
  request: SourceRequest;
  condition: StatementCondition;
};

export type MinaWallet = {
  isConnected: boolean;
  address: string;
};

// TODO merge similar SignedResponse
export type PrivateData = {
  data: {
    value: number;
    hashRoute: string;
  };
  signature: string;
  publicKey: string;
};