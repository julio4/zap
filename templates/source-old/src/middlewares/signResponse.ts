import { ParameterizedContext, Next } from 'koa';
import {
  PrivateKey,
  Signature,
  Encoding,
  Field,
  Poseidon,
} from 'o1js';

import { ResponseBody, SignedResponse } from '../types';

export async function signResponse(ctx: ParameterizedContext, next: Next) {
  await next();

  // We return `value` for the route `route`
  const { value, route } = ctx.body as ResponseBody;

  const routeObj = {
    route: route,
    args: ctx.state.args,
  };

  const routeFields: Field[] = Encoding.stringToFields(JSON.stringify(routeObj));
  const hashRoute: Field = Poseidon.hash(routeFields);

  const data = [
    value,
    hashRoute.toString(),
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
  } as SignedResponse;

  // Example of how to verify the signature
  // const response = ctx.body as SignResponse;
  // const response_data_fields = response.data.map((field_string) => Field.from(field_string));
  // const verify = Signature.fromBase58(response.signature).verify(PublicKey.fromBase58(response.publicKey), response_data_fields);
  // const response_data_fields_as_string = response_data_fields.map((field) => field.toString());

  // console.log(
  //   'value:', response_data_fields_as_string[0],
  //   'hashRoute:', Field.from(response_data_fields_as_string[1]).toString(),
  //   'verified:', verify.toBoolean()
  // );
}
