import { Field } from "o1js";
import { ZapHashedResponse } from "./types.js";

export const encodeResAsFields = (res: ZapHashedResponse): Field[] => {
  const data = [res.value, res.hashRoute];
  return data.map((value) => Field.from(value));
};
