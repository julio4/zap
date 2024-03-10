import { ParameterizedContext, Next } from 'koa';
import { PrivateKey, Signature, Encoding, Field, Poseidon } from 'o1js';

type body = {
  value: number;
  route: string;
};

type SignResponse = {
  data: string[]; // data.map((field) => field.toString())
  signature: string; // Signature.toBase58()
  publicKey: string; // PublicKey.toBase58()
};

/**
 * Signs a response with a private key.
 *
 * This function takes the Koa context, extracts the body, and signs
 * the specified fields (value and route). It uses the private key
 * from environment variables to generate a signature and public key.
 * This signature is then appended to the response.
 *
 * @param {ParameterizedContext} ctx - Koa context containing the response data.
 * @param {Next} next - The next middleware function in the Koa stack.
 * @returns {Promise<void>} A promise that resolves when the function has completed.
 */
export async function signResponse(ctx: ParameterizedContext, next: Next) {
  await next();

  // Encode the JSON data as fields
  const { value, route } = ctx.body as body;
  const routeObj = {
    path: route,
    args: ctx.state.args,
  };
  const routeFields = Encoding.stringToFields(JSON.stringify(routeObj));
  const hashRouteField = Poseidon.hash(routeFields);
  const hashRoute = hashRouteField.toString();

  const data = [
    Math.round(value), // TODO: Need to work with decimal to avoid rounding errors
    hashRoute,
  ];
  const data_fields = data.map((value) => Field.from(value));
  const data_field_as_string = data_fields.map((field) => field.toString());

  // Load the private key of our account from an environment variable
  const privateKey = PrivateKey.fromBase58(process.env['PRIVATE_KEY'] || '');

  // Compute the public key associated with the private key
  const publicKey = privateKey.toPublicKey().toBase58();

  // Use private key to sign an array of Fields containing the requested data
  const signature = Signature.create(privateKey, data_fields).toBase58();

  // format response into Mina compatible signature scheme
  ctx.body = {
    data: data_field_as_string,
    signature,
    publicKey,
  } as SignResponse;
}
