import { Field, Mina, PublicKey, Signature, fetchAccount } from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { Zap } from "@zap/core";
import { Condition } from "../types";

const state = {
  Zap: null as null | typeof Zap,
  zkapp: null as null | Zap,
  transaction: null as null | Transaction,
  creatingTransaction: false,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToBerkeley: async () => {
    const Berkeley = Mina.Network({
      mina: "https://proxy.berkeley.minaexplorer.com/graphql",
      archive: "https://api.minascan.io/archive/berkeley/v1/graphql",
    });
    console.log("Berkeley Instance Created");
    Mina.setActiveInstance(Berkeley);
  },

  loadContract: async () => {
    const { Zap } = await import("@zap/core");
    state.Zap = Zap;
  },

  compileContract: async () => {
    if (!state.Zap) {
      throw new Error("Contract not loaded");
    }
    await state.Zap.compile();
  },

  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },

  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    if (!state.Zap) {
      throw new Error("Contract not loaded");
    }
    state.zkapp = new state.Zap(publicKey);
  },

  createGenerateAttestationTransaction: async (args: {
    senderKey58: string;
    conditionType: Condition;
    targetValue: number;
    value: number;
    hashRoute: string;
    signature: string;
  }) => {
    try {
      const {
        senderKey58,
        conditionType,
        targetValue,
        value,
        hashRoute,
        signature,
      } = args;

      let conditionTypeNumber: number;
      switch (conditionType) {
        case Condition.LESS_THAN:
          conditionTypeNumber = 1;
          break;
        case Condition.GREATER_THAN:
          conditionTypeNumber = 2;
          break;
        case Condition.EQUAL:
          conditionTypeNumber = 3;
          break;
        case Condition.DIFFERENT:
          conditionTypeNumber = 4;
          break;
        default:
          throw new Error("conditionType not supported");
      }

      const transaction = await Mina.transaction(
        PublicKey.fromBase58(senderKey58),
        () => {
          if (!state.zkapp) {
            throw new Error("zkapp not initialized");
          }
          state.zkapp.verify(
            Field.from(conditionTypeNumber),
            Field.from(targetValue),
            Field.from(hashRoute),
            Field.from(value),
            Signature.fromBase58(signature)
          );
        }
      );
      state.transaction = transaction;
    } catch (error) {
      console.log("Error in createGenerateAttestationTransaction: ", error);
    }
  },

  proveGenerateAttestationTransaction: async () => {
    if (!state.transaction) {
      throw new Error("transaction not created");
    }
    await state.transaction.prove();
  },

  getOraclePublicKey: async () => {
    if (!state.zkapp) {
      throw new Error("zkapp not initialized");
    }
    return state.zkapp.getOraclePublicKey().toBase58();
  },

  setOraclePublicKey: async (args: {
    senderKey58: string;
    newOraclePublicKey58: string;
  }) => {
    const { senderKey58, newOraclePublicKey58 } = args;

    try {
      const transaction = await Mina.transaction(
        PublicKey.fromBase58(senderKey58),
        () => {
          if (!state.zkapp) {
            throw new Error("zkapp not initialized");
          }
          state.zkapp.setOraclePublicKey(
            PublicKey.fromBase58(newOraclePublicKey58)
          ); // B62qmN3EthPdRmnit65JWNSbdYdXSt9vt766rt2em2eLoAewf8o72V2
        }
      );
      state.transaction = transaction;
    } catch (error) {
      console.log("error in zkappWorker for setOraclePublicKey", error);
    }
  },
  getTransactionJSON: async () => {
    if (!state.transaction) {
      throw new Error("transaction not created");
    }
    return state.transaction.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== "undefined") {
  addEventListener(
    "message",
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}

console.log("Web Worker Successfully Initialized."); //todo: are we sure about this?
