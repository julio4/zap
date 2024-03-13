import { AttestationNote } from "../types";
import { ConditionType, Route } from "@zap/types";

const getConditionString = (condition: ConditionType) => {
  switch (condition) {
    case ConditionType.LT:
      return "less than";
    case ConditionType.GT:
      return "greater than";
    case ConditionType.EQ:
      return "equal to";
    case ConditionType.NEQ:
      return "different from";
    default:
      return "unknown condition";
  }
};

export const createAttestationNoteEncoded = (
  conditionType: ConditionType,
  targetValue: number,
  request: Route,
  hashRoute: string,
  hashAttestation: string,
  sender: string
): string => {
  const operation = getConditionString(conditionType);

  // todo: we should put in the statement "I, ${Mina address}, ..." and use that addres to fetch events (faster) + better ux
  const attestation: AttestationNote = {
    attestationHash: hashAttestation,
    statement: `I, ${sender}, attest that my value is ${operation} ${targetValue} for ${
      request.path
    } with ${JSON.stringify(request.args)}.`,
    targetValue: targetValue,
    conditionType: operation,
    hashRoute: hashRoute,
    sender: sender,
  };

  return noteToBase64(attestation);
};

export const decodeAttestationNote = (
  base64Attestation: string
): AttestationNote => {
  const jsonString = Buffer.from(base64Attestation, "base64").toString("utf-8");
  const attestation = JSON.parse(jsonString);

  // Throw error if the attestation is not valid (i.e wrong type with AttestationNote)
  if (
    !Object.hasOwn(attestation, "attestationHash") ||
    !Object.hasOwn(attestation, "statement") ||
    !Object.hasOwn(attestation, "targetValue") ||
    !Object.hasOwn(attestation, "conditionType") ||
    !Object.hasOwn(attestation, "hashRoute") ||
    !Object.hasOwn(attestation, "sender")
  ) {
    throw new Error("Invalid note");
  }

  return attestation as AttestationNote;
};

export const noteToBase64 = (note: AttestationNote): string => {
  const jsonString = JSON.stringify(note);
  return Buffer.from(jsonString).toString("base64");
};
