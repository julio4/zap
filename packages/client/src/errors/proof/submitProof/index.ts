
export abstract class SubmitProofError extends Error {
  constructor(message: string) {
    super(message);
  }
}