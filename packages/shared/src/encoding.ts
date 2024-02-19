import { Field, Poseidon, PublicKey } from "o1js";
import { ZapHashedResponse, ConditionType } from "@zap/types";

export const encodeResAsFields = (res: ZapHashedResponse): Field[] => {
  const data = [res.value, res.hashRoute];
  return data.map((value) => Field.from(value));
};

export const convertConditionEnumToNumber = (
  condition: ConditionType
): number => {
  switch (condition) {
    case ConditionType.LT:
      return 1;
    case ConditionType.GT:
      return 2;
    case ConditionType.EQ:
      return 3;
    case ConditionType.NEQ:
      return 4;
    default:
      throw new Error("conditionType not supported");
  }
};

export const getConditionString = (condition: ConditionType) => {
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
      throw new Error("conditionType not supported");
  }
};


export const calculateAttestationHash = (
  conditionType: ConditionType,
  hashRoute: string,
  targetValue: number,
  sender: string
): string => {
  let conditionTypeNumber = convertConditionEnumToNumber(conditionType);

  const attestationHash = Poseidon.hash([
    Field.from(hashRoute),
    Field.from(conditionTypeNumber),
    Field.from(targetValue),
    PublicKey.fromBase58(sender).toFields()[0],
  ]).toString();

  return attestationHash;
};
