import {
  Field,
  Mina,
  PublicKey,
  Signature,
  fetchAccount,
} from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

// import type { Zap } from '../../../contracts/src/Zap';
import type { Zap } from "zap/src/Zap";
import { Condition } from "../types";

const state = {
  Zap: null as null | typeof Zap,
  zkapp: null as null | Zap,
  transaction: null as null | Transaction,
  creatingTransaction: false,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToBerkeley: async (args: {}) => {
    console.log("in worker, setActiveInstanceToBerkeley");
    const Berkeley = Mina.Network(
      "https://proxy.berkeley.minaexplorer.com/graphql"
    );
    console.log("Berkeley Instance Created");
    Mina.setActiveInstance(Berkeley);
  },

  loadContract: async (args: {}) => {
    const { Zap } = await import("../../../../zap/build/Zap.js");
    state.Zap = Zap;
  },

  compileContract: async (args: {}) => {
    await state.Zap!.compile();
  },

  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },

  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.Zap!(publicKey);
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
          state.zkapp!.verify(
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

  proveGenerateAttestationTransaction: async (args: {}) => {
    console.log("in worker, proveGenerateAttestationTransaction");
    await state.transaction!.prove();
  },

  getOraclePublicKey: async (args: {}) => {
    return state.zkapp!.getOraclePublicKey().toBase58();
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
          state.zkapp!.setOraclePublicKey(
            PublicKey.fromBase58(newOraclePublicKey58)
          ); // B62qmN3EthPdRmnit65JWNSbdYdXSt9vt766rt2em2eLoAewf8o72V2
        }
      );
      state.transaction = transaction;
    } catch (error) {
      console.log("error in zkapp worker for setoraclepublickey", error);
    }
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
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
