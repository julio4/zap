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
  console.log('hashroute initiale!!', hashRoute);
  console.log('dataFields_as_string', data_field_as_string);

  // Compute the public key associated with the private key
  const publicKey = privateKey.toPublicKey().toBase58();

  // Use private key to sign an array of Fields containing the requested data
  console.log('dataFields', data_fields);
  /*       const hashRouteMock = Poseidon.hash([Field(145)]);
      const signatureOfOracle = Signature.create(zapKeys.privateKey, [
        Field(1),
        hashRouteMock,
      ]); */

  const signature = Signature.create(privateKey, data_fields).toBase58();

  // format response into Mina compatible signature scheme
  ctx.body = {
    data: data_field_as_string,
    signature,
    publicKey,
  } as SignResponse;

  // Example of how to verify the signature
  /*   const response = ctx.body as SignResponse;
  const response_data_fields = response.data.map((field_string) =>
    Field.from(field_string)
  );
  const verify = Signature.fromBase58(response.signature).verify(
    PublicKey.fromBase58(response.publicKey),
    response_data_fields
  );
  const response_data_fields_as_string = response_data_fields.map((field) =>
    field.toString()
  );

  console.log(
    'value:',
    response_data_fields_as_string[0],
    'hashRoute:',
    Field.from(response_data_fields_as_string[1]).toString(),
    'verified:',
    verify.toBoolean()
  ); */
}
