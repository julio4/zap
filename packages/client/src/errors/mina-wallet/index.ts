
export abstract class MinaWalletError extends Error {
  constructor(message: string) {
    super(message);
  }
}