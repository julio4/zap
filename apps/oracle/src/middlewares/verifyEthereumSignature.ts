import { ParameterizedContext, Next } from 'koa';
import { ethers } from 'ethers';

export async function verifyEthereumSignature(
  ctx: ParameterizedContext,
  next: Next
) {
  try {
    const { address, signature, args } = ctx.request.body;

    // Save the address to the request context for further use
    ctx.state.address = address;
    // Save route args
    ctx.state.args = args;

    if (process.env['NODE_ENV'] !== 'development') {
      // Skip signature verification in development mode

      // Verify the signature
      const signerAddr = await ethers.verifyMessage(address, signature);

      if (signerAddr !== address) {
        throw new Error('Invalid signature');
      }
    }

    await next();
  } catch (error) {
    ctx.throw(401, 'Invalid signature');
  }
}
