import { VerifyAttestationError } from "./index.js";

export class ExpiredError extends VerifyAttestationError {
  constructor() {
    super("Attestation expired");
  }
}