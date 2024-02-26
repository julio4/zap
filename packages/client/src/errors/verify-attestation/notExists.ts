import { VerifyAttestationError } from "./index.js";

export class NotExistsError extends VerifyAttestationError {
  constructor() {
    super("Attestation note does not exist");
  }
}