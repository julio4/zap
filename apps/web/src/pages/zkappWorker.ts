import { Field, Mina, PublicKey, Signature, fetchAccount } from "snarkyjs";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

// import type { Zap } from '../../../contracts/src/Zap';
import type { Zap } from "@contracts/zap/src/Zap";
import { stringToFields } from "snarkyjs/dist/node/bindings/lib/encoding.js";
import { Condition, OracleRequest } from "../types.js";

const state = {
  Zap: null as null | typeof Zap,
  zkapp: null as null | Zap,
  transaction: null as null | Transaction,
  creatingTransaction: false,
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
    const { Zap } = await import("../../../../contracts/zap/build/src/Zap.js");
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
    conditionType: Condition;
    targetValue: number;
    hashRoute: string;
    privateData: number;
    signature: string;
  }) => {
    console.log(
      "we are in createGenerateAttestationTransaction in worker backend"
    );
    const { conditionType, targetValue, hashRoute, privateData, signature } =
      args;

    console.log(
      "in worker before callsc: conditionType",
      Field.from(conditionType).toString()
    );
    console.log(
      "in worker before callsc: targetValue",
      Field.from(targetValue).toString()
    );
    console.log(
      "in worker before callsc: hashRoute",
      Field.from(hashRoute).toString()
    );
    console.log(
      "in worker before callsc: privateData",
      Field.from(privateData).toString()
    );
    console.log(
      "in worker before callsc: signature",
      Signature.fromBase58(signature).toBase58()
    );

    const data = {
      value: targetValue,
      hashRoute: hashRoute,
    };

    const transaction = await Mina.transaction(() => {
      state.zkapp!.verify(
        Field(conditionType),
        Field(targetValue),
        data.map(f => Field.from(f)),
        Signature.fromBase58(signature)
      );
    });
    state.transaction = transaction;
  },
  proveGenerateAttestationTransaction: async (args: {}) => {
    await state.transaction!.prove();
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

console.log("Web Worker Successfully Initialized.");
