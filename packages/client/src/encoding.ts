import { ConditionTypeString } from "@zap/types";

/**
 * generate a base64 object that contains the hash of the route, the condition type, the target value and the sender
 *
 * @param hashRoute
 * @param conditionType
 * @param targetValue
 * @param sender
 */
export const generateBase64Attestation = (
  hashRoute: string,
  conditionType: ConditionTypeString,
  targetValue: string,
  sender: string
) => {
  const concatFields = `${hashRoute};${conditionType};${targetValue};${sender}`;
  let buff = Buffer.from(concatFields, "utf-8");
  let base64Data = buff.toString("base64");
  return base64Data;
};

/**
 * decode the base64 object that contains the hash of the route, the condition type, the target value and the sender
 * @param base64String
 */
export const decodeBase64Attestation = (base64String: string) => {
  let buff = Buffer.from(base64String, "base64");
  let originalData = buff.toString("utf-8");
  return originalData;
};
