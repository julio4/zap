import { Field } from "o1js";

// export * from "./shared/index.js";
export * from "./source/index.js";
export * from "./frontend/index.js";

export const fieldsToStrings = (fields: Field[]): string[] => {
  return fields.map((field) => field.toString());
};

export const fieldStrToStrings = (field: string): string => {
  return Field.from(field).toString();
};
