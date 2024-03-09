import { Field, Mina, PublicKey, Signature, fetchAccount } from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import { ProvableStatement, Verifier } from "@zap/core";
import { ConditionType, Statement, StatementCondition } from "@zap/types";

const state = {
  Verifier: null as null | typeof Verifier,
  zkapp: null as null | Verifier,
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
    const { Verifier } = await import("@zap/core");
    state.Verifier = Verifier;
  },

  compileContract: async () => {
    if (!state.Verifier) {
      throw new Error("Contract not loaded");
    }
    await state.Verifier.compile();
  },

  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },

  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    if (!state.Verifier) {
      throw new Error("Contract not loaded");
    }
    state.zkapp = new state.Verifier(publicKey);
  },

  createGenerateAttestationTransaction: async (args: {
    senderKey58: string;
    sourceKey58: string
    statementCondition: StatementCondition;
    value: number;
    hashRoute: string;
    signature: string;
  }) => {
    try {
      const {
        senderKey58,
        sourceKey58,
        statementCondition: { type, targetValue },
        value,
        hashRoute,
        signature,
      } = args;

      if (!(type in ConditionType)) {
        throw new Error("conditionType not supported");
      }

      const statement: Statement = {
        sourceKey: sourceKey58,
        route: {
          path: hashRoute,
        },
        condition: {
          type: type,
          targetValue,
        },
      };

      const provableStatement: ProvableStatement = ProvableStatement.from(statement);

      const transaction = await Mina.transaction(
        PublicKey.fromBase58(senderKey58),
        () => {
          if (!state.zkapp) {
            throw new Error("zkapp not initialized");
          }
          state.zkapp.verify(
            provableStatement,
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
