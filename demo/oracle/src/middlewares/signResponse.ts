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
  args: {value: Field, hashRoute: Field};
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
  const dataFields = data.map((field) => Field.from(field));

  const data_field_as_string = dataFields.map((field) => field.toString());

  // Load the private key of our account from an environment variable
  const privateKey = PrivateKey.fromBase58(process.env['PRIVATE_KEY'] || '');
  console.log('hashroute initiale!!', hashRoute);
  console.log('dataFields_as_string', data_field_as_string);

  // Compute the public key associated with the private key
  const publicKey = privateKey.toPublicKey().toBase58();

  // Use private key to sign an array of Fields containing the requested data
  console.log('dataFields', dataFields);
  /*       const hashRouteMock = Poseidon.hash([Field(145)]);
      const signatureOfOracle = Signature.create(zapKeys.privateKey, [
        Field(1),
        hashRouteMock,
      ]); */

  console.log("WHAT DID WE SIGN???")
  console.log(dataFields[0])
  console.log(dataFields[1])
  console.log("====================================")

  const signature = Signature.create(privateKey, [Field(data[0]), hashRouteField]).toBase58();
  console.log('We just created the signature!!: ', signature);
  // format response into Mina compatible signature scheme
  ctx.body = {
    data: data_field_as_string,
    signature,
    publicKey,
    args: {value: Field(data[0]), hashRoute: hashRouteField},
  } as SignResponse;
}
