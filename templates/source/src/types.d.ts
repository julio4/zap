export type ZapRequestParams = {
  args: {
    [key: string]: string;
  }
}

/*
 * Response Object (Unsigned)
 */

// The response body that each controller will return in the res.json() call
type SourceResponseBody<T> = {
  value: T;
  route: string;
};
// Supported response types
export type ZapResponse = SourceResponseBody<number>;

export type Route = {
  route: string;
  args: ZapRequestParams['args'];
};

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
 */
export type SignedResponse<T> = {
  data: T; 
  signature: string;  // Signature.toBase58()
  publicKey: string;  // PublicKey.toBase58()
};
export type ZapSignedResponse = SignedResponse<ZapHashedResponse>;
