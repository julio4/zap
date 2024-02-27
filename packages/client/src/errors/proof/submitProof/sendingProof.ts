import { SubmitProofError } from "./index.js";

export class SendingProofError extends SubmitProofError {
  constructor(message: string) {
    super(`Error sending transaction: ${message}.\n Please try again.`)
  }
}