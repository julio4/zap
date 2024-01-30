import { fetchAccount, Field, PublicKey, Signature } from "o1js";

import {
  ZapWorkerRequest,
  ZapWorkerReponse,
  WorkerFunctions,
} from "./zapWorker.js";

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
    conditionType: Field,
    targetValue: Field,
    hashRoute: Field,
    privateData: Field,
    signature: Signature
  ) {
    return this._call("createVerifyTransaction", {
      conditionType: JSON.stringify(conditionType.toJSON()),
      targetValue: JSON.stringify(targetValue.toJSON()),
      hashRoute: JSON.stringify(hashRoute.toJSON()),
      privateData: JSON.stringify(privateData.toJSON()),
      signature: JSON.stringify(signature.toJSON()),
    });
  }

  proveTransaction() {
    return this._call("proveTransaction", {});
  }

  async getTransactionJSON() {
    const result = await this._call("getTransactionJSON", {});
    return result;
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
