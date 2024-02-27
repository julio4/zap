import { SubmitProofError } from "./index.js";

export class AttestationHashBase64Error extends SubmitProofError {
  constructor() {
    super("attestationHashBase64 is null.")
  }
}