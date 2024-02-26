
import { StatementError } from "./index.js";

export class HashRouteVerificationError extends StatementError {
  constructor() {
    super("Hash route verification failed.");
  }
}