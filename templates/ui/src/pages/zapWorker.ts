import { Mina, PublicKey, fetchAccount, Signature, Field } from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { Zap } from "@zap/core";

const state = {
  Zap: null as null | typeof Zap,
  zap: null as null | Zap,
  tx: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToBerkeley: async (args: {}) => {
    const Berkeley = Mina.Network(
      "https://proxy.berkeley.minaexplorer.com/graphql"
    );
    console.log("Berkeley Instance Created");
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async (args: {}) => {
    const { Zap } = await import("@zap/core");
    state.Zap = Zap;
  },
  compileContract: async (args: {}) => {
    await state.Zap!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZapInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zap = new state.Zap!(publicKey);
  },
  getOraclePublicKey: async (args: {}) => {
    const publicKey = state.zap!.oraclePublicKey.get();
    return JSON.stringify(publicKey.toJSON());
  },
  createVerifyTransaction: async (args: {
    conditionType: string;
    targetValue: string;
    hashRoute: string;
    privateData: string;
    signature: string;
  }) => {
    const transaction = await Mina.transaction(() => {
      state.zap!.verify(
        Field.fromJSON(JSON.parse(args.conditionType)),
        Field.fromJSON(JSON.parse(args.targetValue)),
        Field.fromJSON(JSON.parse(args.hashRoute)),
        Field.fromJSON(JSON.parse(args.privateData)),
        Signature.fromJSON(JSON.parse(args.signature))
      );
    });
    state.tx = transaction;
  },
  proveTransaction: async (args: {}) => {
    await state.tx!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.tx!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZapWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZapWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== "undefined") {
  addEventListener("message", async (event: MessageEvent<ZapWorkerRequest>) => {
    const returnData = await functions[event.data.fn](event.data.args);

    const message: ZapWorkerReponse = {
      id: event.data.id,
      data: returnData,
    };
    postMessage(message);
  });
}

console.log("Zap Web Worker Successfully Initialized.");
