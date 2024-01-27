import { Poseidon, Field, PublicKey } from "o1js";
import { ArgsHashAttestationCalculator, Condition } from "../types";

export const calculateAttestationHash = (
  argsAttestation: ArgsHashAttestationCalculator
) => {
  let conditionTypeNumber: number;
  switch (argsAttestation.conditionType) {
    case Condition.LESS_THAN:
      conditionTypeNumber = 1;
      break;
    case Condition.GREATER_THAN:
      conditionTypeNumber = 2;
      break;
    case Condition.EQUAL:
      conditionTypeNumber = 3;
      break;
    case Condition.DIFFERENT:
      conditionTypeNumber = 4;
      break;
    default:
      throw new Error("conditionType not supported");
  }

  const hashAttestation = Poseidon.hash([
    Field.from(argsAttestation.hashRoute),
    Field.from(conditionTypeNumber),
    Field.from(argsAttestation.targetValue),
    PublicKey.fromBase58(argsAttestation.sender).toFields()[0],
  ]).toString();

  return hashAttestation;
};
