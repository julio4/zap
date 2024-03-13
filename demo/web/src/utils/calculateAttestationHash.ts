import { Poseidon, Field, PublicKey } from "o1js";
import { ArgsHashAttestationCalculator, Condition } from "../types";
import { ConditionType } from "@zap/types";

export const calculateAttestationHash = (
  argsAttestation: ArgsHashAttestationCalculator
) => {
  let conditionTypeNumber = argsAttestation.conditionType;
  console.log("conditionTypeNumber", conditionTypeNumber);
  if (conditionTypeNumber > 4) {
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
