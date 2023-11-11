import { ParameterizedContext, Next } from 'koa';
import {
  PrivateKey,
  Signature,
  Encoding,
  Field,
  PublicKey,
  Poseidon,
} from 'o1js';

type body = {
  value: number;
  route: string;
};

type SignResponse = {
  data: string[]; // data.map((field) => field.toString())
  signature: string; // Signature.toBase58()
  publicKey: string; // PublicKey.toBase58()
};

export async function signResponse(ctx: ParameterizedContext, next: Next) {
  await next();

  // Encode the JSON data as fields
  const { value, route } = ctx.body as body;
  const routeObj = {
    route: route,
    args: ctx.state.args,
  };
  const routeFields = Encoding.stringToFields(JSON.stringify(routeObj));
  const hashRoute = Poseidon.hash(routeFields).toString();

  const data = [
    Math.round(value),  // TODO: Need to work with decimal to avoid rounding errors
    hashRoute,
  ]
  const dataFields = data.map((field) => Field.from(field));

  const data_field_as_string = dataFields.map((field) => field.toString());

  // Load the private key of our account from an environment variable
  const privateKey = PrivateKey.fromBase58(process.env['PRIVATE_KEY'] || '');

  // Compute the public key associated with the private key
  const publicKey = privateKey.toPublicKey().toBase58();

  // Use private key to sign an array of Fields containing the requested data
  const signature = Signature.create(privateKey, dataFields).toBase58();

  // format response into Mina compatible signature scheme
  ctx.body = {
    data: data_field_as_string,
    signature,
    publicKey,
  } as SignResponse;
}
