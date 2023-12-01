import { Condition, AttestationNote, OracleRequest } from "../types";

const getConditionString = (condition: Condition) => {
  switch (condition) {
    case Condition.LESS_THAN:
      return "less than";
    case Condition.GREATER_THAN:
      return "greater than";
    case Condition.EQUAL:
      return "equal to";
    case Condition.DIFFERENT:
      return "different from";
    default:
      return "unknown condition";
  }
};

export const createAttestationNoteEncoded = (
  conditionType: Condition,
  targetValue: number,
  value: number,
  request: OracleRequest,
  hashRoute: string,
  hashAttestation: string
): string => {
  const operation = getConditionString(conditionType);

  const attestation: AttestationNote = {
    attestationHash: hashAttestation,
    statement: `I attest that my value is ${operation} ${targetValue} for ${request.route} with ${JSON.stringify(request.args)}.`,
    value: value,
    targetValue: targetValue,
    conditionType: conditionType,
    hashRoute: hashRoute,
  };

  const jsonString = JSON.stringify(attestation);
  return Buffer.from(jsonString).toString("base64");
};

export const decodeAttestationNote = (base64Attestation: string): AttestationNote => {
  const jsonString = Buffer.from(base64Attestation, "base64").toString("utf-8");
  const attestation = JSON.parse(jsonString);

  // Throw error if the attestation is not valid (i.e wrong type with AttetationNote)
  if (
    !attestation.hasOwnProperty("attestationHash") ||
    !attestation.hasOwnProperty("statement") ||
    !attestation.hasOwnProperty("value") ||
    !attestation.hasOwnProperty("targetValue") ||
    !attestation.hasOwnProperty("conditionType") ||
    !attestation.hasOwnProperty("hashRoute")
  ) {
    throw new Error("Invalid note");
  }

  return attestation as AttestationNote;
}
