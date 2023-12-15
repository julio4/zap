import { Request, Response } from "express";

export type ZapRequestParams = {
  mina_address: string;
  args?: {
    [key: string]: any;
  }
}

export type Route = {
  path: string;
  args?: {
    [key: string]: any;
  }
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
export type SupportedValue = number;
export type ZapResponse = SourceResponseBody<SupportedValue>;

// The response body with hashed route
// @see helpers#hashResponse
type SourceHashedResponse<T> = {
  value: T;
  hashRoute: string; // Hash(Route)
}
// Supported response types
export type ZapHashedResponse = SourceHashedResponse<number>;

/*
 * Signed Response Object
 * This is what should be sent and received by the client
 * The integrity of `data` is ensured by the `signature` and `publicKey`
 */
export type SignedResponse<T> = {
  data: T;
  signature: string;  // Signature.toBase58()
  publicKey: string;  // PublicKey.toBase58()
};

// This is the response that the client will receive
// In it, data contains the value and the corresponding route (with args)
export type ZapSignedResponse = SignedResponse<ZapHashedResponse>;

// For express
export type ZapResponseExpress = Response<SupportedValue>;
// The ZapMiddleware will transform the ZapResponseExpress into Response<ZapSignedResponse>
export type ZapRequestExpress = Request<any, ZapResponse, ZapRequestParams>;