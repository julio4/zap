
export abstract class StatementError extends Error {
  constructor(message: string) {
    super(message);
  }
}