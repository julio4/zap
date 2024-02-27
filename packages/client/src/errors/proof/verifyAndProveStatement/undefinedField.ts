import { VerifyAndProveStatementError } from "./index.js";

export class UndefinedFieldError extends VerifyAndProveStatementError {
  constructor(field: string) {
    super(`${field} is not defined`);
  }
}