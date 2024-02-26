
export abstract class VerifyAttestationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidNoteError extends Error {
  constructor() {
    super("Invalid note.");
  }
}