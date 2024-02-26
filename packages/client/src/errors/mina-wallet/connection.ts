import { MinaWalletError } from "./index.js";

export class ConnectionError extends MinaWalletError {
  constructor(err: any) {
    super("Error connecting to Mina wallet. See following details: " + err);
  }
}
