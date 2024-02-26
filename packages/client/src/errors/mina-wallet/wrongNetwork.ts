import { MinaWalletError } from "./index.js";

export class WrongNetworkError extends MinaWalletError {
  constructor() {
    super("Mina wallet is not connected to Berkeley Testnet. Please switch to Berkeley Testnet and try again.");
  }
}