import { Route } from "./core.js";

export type ZapRequestParams = {
  mina_address: string;
  args?: {
    [key: string]: any;
  };
};

/*
 * Response Object (Unsigned)
 */

// The response body that each controller will return in the res.json() call
type SourceResponseBody<T> = {
  value: T;
  route: Route;
};
// Supported response types
export type SupportedTargetValue = number;
export type ZapResponse = SourceResponseBody<SupportedTargetValue>;

// The response body with hashed route
// @see helpers#hashResponse
type SourceHashedResponse<T> = {
  value: T;
  hashRoute: string; // Hash(Route)
};
// Supported response types
export type ZapHashedResponse = SourceHashedResponse<number>;

/*
 * Signed Response Object
 * This is what should be sent and received by the client
 * The integrity of `data` is ensured by the `signature` and `publicKey`
 */
export type SignedResponse<T> = {
  data: T;
  signature: string; // Signature.toBase58()
  publicKey: string; // PublicKey.toBase58()
};

// This is the response that the client will receive
// In it, data contains the value and the corresponding route (with args)
export type ZapSignedResponse = SignedResponse<ZapHashedResponse>;
