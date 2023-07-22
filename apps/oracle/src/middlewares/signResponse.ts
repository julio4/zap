import { ParameterizedContext, Next } from 'koa';
import { PrivateKey, Signature, Encoding, Field, PublicKey } from 'snarkyjs';

type SignResponse = {
  data: Field[];
  signature: Signature;
  publicKey: PublicKey;
};

export async function signResponse(ctx: ParameterizedContext, next: Next) {
  await next();

  // Encode the JSON data as fields
  const data = Encoding.stringToFields(JSON.stringify(ctx.body));
  // TODO: faire data = [data.privateData,data.hashRoute]
  console.log('Response data: ', JSON.stringify(ctx.body));

  // Load the private key of our account from an environment variable
  const privateKey = PrivateKey.fromBase58(process.env['PRIVATE_KEY'] || '');

  // Compute the public key associated with the private key
  const publicKey = privateKey.toPublicKey();

  // Use private key to sign an array of Fields containing the requested data
  const signature = Signature.create(privateKey, [...data]); // et après avoir fait les changements L15, ici mettre juste create[privateKey, data]

  // format response into Mina compatible signature scheme
  ctx.body = {
    data,
    signature,
    publicKey,
  };

  // TODO: remove this part later

  // console.log('SignResponse middleware: ', ctx.body)

  // // example of decoding
  // const body = ctx.body as SignResponse;
  // // signature verification
  // const verified = body.signature.verify(body.publicKey, body.data);
  // const decoded = Encoding.stringFromFields(body.data);
  // console.log('Decoded: ', decoded, 'Verified: ', verified.toBoolean().toString());
}
