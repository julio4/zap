import { Condition, AttestationNote, OracleRequest, OracleRoute } from "../types";

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
  hashAttestation: string,
  sender: string
): string => {
  const operation = getConditionString(conditionType);

  // todo: we should put in the statement "I, ${Mina address}, ..." and use that addres to fetch events (faster) + better ux
  const attestation: AttestationNote = {
    attestationHash: hashAttestation,
    statement: `I, ${sender}, attest that my value is ${operation} ${targetValue} for ${
      request.route
    } with ${JSON.stringify(request.args)}.`,
    value: value,
    targetValue: targetValue,
    conditionType: conditionType,
    hashRoute: hashRoute,
    sender: sender,
  };

  const jsonString = JSON.stringify(attestation);
  return Buffer.from(jsonString).toString("base64");
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
    !Object.hasOwn(attestation, "value") ||
    !Object.hasOwn(attestation, "targetValue") ||
    !Object.hasOwn(attestation, "conditionType") ||
    !Object.hasOwn(attestation, "hashRoute") ||
    !Object.hasOwn(attestation, "sender")
  ) {
    throw new Error("Invalid note");
  }

  return attestation as AttestationNote;
};

const fakeNote=createAttestationNoteEncoded(
  Condition.GREATER_THAN,
  1000,
  9000,
  {
    route: OracleRoute.BALANCE,
    args: {
        token: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        blockchain: "polygon"
    }
},
  "24771613593952144968161186171837982514830394192519219838611160378286992541903",
  "17613068260150588986788240600449359622364004875948701399924500458447005281944",
  'B62qm3bbCSy8ixuacL8FJzWdoj9MBjQGgrzHwiHtksBHTtmFWhidKxS'
)

console.log("my fake note is: ", fakeNote)