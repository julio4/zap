import { SubmitProofError } from "./index.js";

export class VerificationTxJsonError extends SubmitProofError {
  constructor() {
    super("verificationTxJson is null.")
  }
}