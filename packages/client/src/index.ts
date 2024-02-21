import { ConditionType, ConditionTypeString } from "@zap/types";

export * from "./encoding.js";
export * from "./source.js";
export * from "./selectStatement.js";
export * from "./provider/index.js";
export * from "./proof/index.js";
export * from "./minaWallet.js";

// To decide later where to put this
export function mapConditionTypeStringToNumber(
  type: ConditionTypeString
): ConditionType {
  switch (type) {
    case "<":
      return ConditionType.LT;
    case ">":
      return ConditionType.GT;
    case "==":
      return ConditionType.EQ;
    case "!=":
      return ConditionType.NEQ;
    default:
      throw new Error(`Invalid condition type: ${type}`);
  }
}

// Web specific
export * from "./worker/zapWorkerClient.js";
// export * from "./zapWorker.js"; // we don't expose the worker directly
