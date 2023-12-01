enum Condition {
  LESS_THAN = "<",
  GREATER_THAN = ">",
  EQUAL = "==",
  DIFFERENT = "!=",
}

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

export const createAttestationObject = (
  conditionType: Condition,
  targetValue: number,
  value: number,
  hashRoute: string,
  hashAttestation: string
) => {
  const operation = getConditionString(conditionType);

  const attestation = {
    attestationHash: hashAttestation,
    statement: `This attestationHash proves that my value is ${operation} ${targetValue} via the specific route ${hashRoute}.`,
    value: value,
    targetValue: targetValue,
    conditionType: conditionType,
    hashRoute: hashRoute,
  };

  const jsonString = JSON.stringify(attestation);
  return Buffer.from(jsonString).toString("base64");
};

export const decodeAttestationObject = (base64Attestation: string) => {
  const jsonString = Buffer.from(base64Attestation, "base64").toString("utf-8");

  return JSON.parse(jsonString);
};
