import { VerifyAttestationError } from "./index.js";

export class DifferentHashError extends VerifyAttestationError {
  constructor() {
    super("Note details do not correspond to the attestation hash, base64 note might have been modified");
  }
}