// These helpers will move to the 'zap' shared package with the common types later.

import {
  PrivateKey,
  Signature,
  PublicKey,
  Encoding,
  Field,
  Poseidon,
} from "o1js";

import {
  ZapRequestParams,
  ZapResponse,
  ZapHashedResponse,
  ZapSignedResponse,
} from "./types";

export const signResponse = (
  res: ZapResponse,
  routeParams: ZapRequestParams,
  privateKey: PrivateKey
): ZapSignedResponse => {
  const publicKey = privateKey.toPublicKey().toBase58();

  // Compute the hash of the route and format the response data
  const data = hashResponse(res, routeParams.args);

  const signature = Signature.create(
    privateKey,
    encodeResAsFields(data)
  ).toBase58();

  return {
    data,
    signature,
    publicKey,
  };
};

export const verifyResponseSignature = (res: ZapSignedResponse): boolean => {
  const data = encodeResAsFields(res.data);
  const signature = Signature.fromBase58(res.signature);
  const publicKey = PublicKey.fromBase58(res.publicKey);

  return signature.verify(publicKey, data).toBoolean();
};

export const hashResponse = (
  res: ZapResponse,
  args: ZapRequestParams["args"]
): ZapHashedResponse => {
  const route = {
    path: res.route,
    args: args,
  };

  const routeAsFields: Field[] = Encoding.stringToFields(JSON.stringify(route));
  const hashRoute: Field = Poseidon.hash(routeAsFields);

  return {
    value: res.value,
    hashRoute: hashRoute.toString(),
  };
};

export const encodeResAsFields = (res: ZapHashedResponse): Field[] => {
  const data = [res.value, res.hashRoute];
  return data.map((value) => Field.from(value));
};

export const fieldsToStrings = (fields: Field[]): string[] => {
  return fields.map((field) => field.toString());
};
