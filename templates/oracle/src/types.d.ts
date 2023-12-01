export type RequestBody = {
  value: number;
  route: string;
};

export type SignedResponse = {
  data: string[];     // data.map((field) => field.toString())
  signature: string;  // Signature.toBase58()
  publicKey: string;  // PublicKey.toBase58()
};
