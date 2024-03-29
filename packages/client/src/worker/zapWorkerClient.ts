import { fetchAccount, PublicKey } from "o1js";

import {
  ZapWorkerRequest,
  ZapWorkerReponse,
  WorkerFunctions,
} from "./zapWorker.js";
import { Statement } from "@zap/types";

export class ZapWorkerClient {
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

  initZapInstance(publicKey: PublicKey) {
    return this._call("initZapInstance", {
      publicKey58: publicKey.toBase58(),
    });
  }

  async getOraclePublicKey(): Promise<PublicKey> {
    const result = await this._call("getOraclePublicKey", {});
    return PublicKey.fromJSON(JSON.parse(result as string));
  }

  createVerifyTransaction(
    statement: Statement,
    privateData: string,
    signature: string
  ) {
    return this._call("createVerifyTransaction", {
      statement,
      privateData,
      signature,
    });
  }

  proveTransaction() {
    return this._call("proveTransaction", {});
  }

  async getTransactionJSON() {
    return await this._call("getTransactionJSON", {}) as string;
  }

  // ---------------------------------------------------------------------------------------

  worker: Worker;

  promises: {
    [id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
  };

  nextId: number;

  constructor() {
    this.worker = new Worker(new URL("./zapWorker.js", import.meta.url));
    this.promises = {};
    this.nextId = 0;
    this.worker.onmessage = (event: MessageEvent<ZapWorkerReponse>) => {
      this.promises[event.data.id].resolve(event.data.data);
      delete this.promises[event.data.id];
    };
  }

  _call(fn: WorkerFunctions, args: any) {
    return new Promise((resolve, reject) => {
      this.promises[this.nextId] = { resolve, reject };
      const message: ZapWorkerRequest = {
        id: this.nextId,
        fn,
        args,
      };
      this.worker.postMessage(message);
      this.nextId++;
    });
  }
}
