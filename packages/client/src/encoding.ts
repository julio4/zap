import { ConditionTypeString, SupportedTargetValue } from "@zap/types";
import { Field, PublicKey } from "o1js";

/**
 * generate a base64 object that contains the hash of the route, the condition type, the target value and the sender
 *
 * @param hashRoute
 * @param conditionType
 * @param targetValue
 * @param sender
 */
export const generateBase64Attestation = (
  hashRoute: Field,
  conditionType: ConditionTypeString,
  targetValue: SupportedTargetValue,
  sender: PublicKey
) => {
  const concatFields = `${hashRoute.toString()};${conditionType.toString()};${targetValue.toString()};${sender.toBase58()}`;
  let buff = Buffer.from(concatFields, "utf-8");
  let base64Data = buff.toString("base64");

  return base64Data;
};

/**
 * decode the base64 object that contains the hash of the route, the condition type, the target value and the sender
 * @param base64String
 */
export const decodeBase64Attestation = (
  base64String: string
): {
  hashRoute: Field;
  conditionType: ConditionTypeString;
  targetValue: SupportedTargetValue;
  sender: PublicKey;
} => {
  let buff = Buffer.from(base64String, "base64");
  let originalData = buff.toString("utf-8");
  const [hashRoute, conditionType, targetValue, sender] =
    originalData.split(";");
  return {
    hashRoute: Field.from(hashRoute),
    conditionType: conditionType as ConditionTypeString,
    targetValue: parseInt(targetValue),
    sender: PublicKey.fromBase58(sender),
  };
};
