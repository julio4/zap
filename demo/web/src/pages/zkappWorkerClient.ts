import { fetchAccount, PublicKey } from "o1js";

import type {
  ZkappWorkerRequest,
  ZkappWorkerReponse,
  WorkerFunctions,
} from "./zkappWorker";
import { StatementCondition, Route } from "@zap/types";

export default class ZkappWorkerClient {
  // ---------------------------------------------------------------------------------------

  setActiveInstanceToBerkeley() {
    return this._call("setActiveInstanceToBerkeley", {});
  }

  loadContract() {
    return this._call("loadContract", {});
  }

  compileContract() {
    return this._call("compileContract", {});
  }

  fetchAccount({
    publicKey,
  }: {
    publicKey: PublicKey;
  }): ReturnType<typeof fetchAccount> {
    const result = this._call("fetchAccount", {
      publicKey58: publicKey.toBase58(),
    });
    return result as ReturnType<typeof fetchAccount>;
  }

  initZkappInstance(publicKey: PublicKey) {
    return this._call("initZkappInstance", {
      publicKey58: publicKey.toBase58(),
    });
  }

  async getTransactionJSON() {
    const result = await this._call("getTransactionJSON", {});
    return result;
  }

  async createGenerateAttestationTransaction({
    senderKey58,
    sourceKey58,
    statementCondition,
    value,
    route,
    hashRouteargs,
    signature,
  }: {
    senderKey58: string;
    sourceKey58: string;
    statementCondition: StatementCondition;
    value: number;
    route: Route,
    hashRouteargs: string;
    signature: string;
  }) {
    await this._call("createGenerateAttestationTransaction", {
      senderKey58,
      sourceKey58,
      statementCondition,
      value,
      route,
      hashRouteargs,
      signature,
    });
  }

  async proveGenerateAttestationTransaction() {
    await this._call("proveGenerateAttestationTransaction", {});
  }

  // ---------------------------------------------------------------------------------------

  worker: Worker;

  promises: {
    [id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
  };

  nextId: number;

  constructor() {
    this.worker = new Worker(new URL("./zkappWorker.ts", import.meta.url));
    this.promises = {};
    this.nextId = 0;

    this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
      this.promises[event.data.id].resolve(event.data.data);
      delete this.promises[event.data.id];
    };
  }

  _call(fn: WorkerFunctions, args: any) {
    return new Promise((resolve, reject) => {
      this.promises[this.nextId] = { resolve, reject };

      const message: ZkappWorkerRequest = {
        id: this.nextId,
        fn,
        args,
      };

      this.worker.postMessage(message);

      this.nextId++;
    });
  }
}
