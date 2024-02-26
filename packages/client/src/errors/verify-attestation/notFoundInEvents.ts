import { VerifyAttestationError } from "./index.js";

export class NotFoundInEventsError extends VerifyAttestationError {
  constructor() {
    super("Attestation not found. Be sure that your transaction has been validated and that the event is indexed in the archives");
  }
}