import {
  Mina,
  PublicKey,
  fetchAccount,
  Signature,
  Field,
} from "o1js";
import { Verifier, ProvableStatement, Attestation } from "@zap/core";
import { Statement } from "@zap/types";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

const state = {
  Verifier: null as null | typeof Verifier,
  verifier: null as null | Verifier,
  tx: null as null | Transaction,
};

const functions: Record<string, (...args: any[]) => any> = {
  setActiveInstanceToBerkeley: async (args: {}) => {
    const Berkeley = Mina.Network(
      "https://proxy.berkeley.minaexplorer.com/graphql"
    );
    console.log("Berkeley Instance Created");
    Mina.setActiveInstance(Berkeley);
  },

  loadContract: async (args: {}) => {
    const { Verifier } = await import("@zap/core");
    state.Verifier = Verifier;
  },

  compileContract: async (args: {}) => {
    await state.Verifier!.compile();
  },

  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },

  initZapInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.verifier = new state.Verifier!(publicKey);
  },

  createVerifyTransaction: async (args: {
    statement: Statement;
    privateData: string;
    signature: string;
    address: string;
  }) => {
    const provableStatement = ProvableStatement.from(args.statement);
    // TODO should we create the attestation object here?
    const attestation = Attestation.fromJSON({
      statement: provableStatement,
      privateData: Field.fromJSON(JSON.parse(args.privateData)),
      signature: Signature.fromJSON(JSON.parse(args.signature)),
      address: PublicKey.fromBase58(args.address),
    });

    const transaction = await Mina.transaction(() => {
      state.verifier!.verify(
        attestation
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

console.log("Zap Worker Successfully Initialized");
