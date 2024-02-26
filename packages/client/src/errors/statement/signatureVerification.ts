
import { StatementError } from "./index.js";

export class SignatureVerificationError extends StatementError {
  constructor() {
    super("Source signature verification failed.");
  }
}