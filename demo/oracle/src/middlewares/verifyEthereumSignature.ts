import { ParameterizedContext, Next } from 'koa';
import { ethers } from 'ethers';

const normalizeAddress = (address: string) => {
  return ethers.getAddress(address);
};

export async function verifyEthereumSignature(
  ctx: ParameterizedContext,
  next: Next
) {
  try {
    const { address, signature, args } = ctx.request.body;
    const normalizedAddress = normalizeAddress(address);

    // Save the address to the request context for further use
    ctx.state.address = normalizedAddress;
    // Save route args
    ctx.state.args = args;

    if (process.env['NODE_ENV'] !== 'development') {
      // Skip signature verification in development mode

      // Verify the signature
      const signerAddr = await ethers.verifyMessage(
        `I am ${normalizedAddress}`,
        signature
      );
      const normalizedSignerAddr = normalizeAddress(signerAddr);

      if (normalizedSignerAddr != normalizedAddress) {
        throw new Error('Invalid signature');
      }
    }

    await next();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      ctx.throw(401, (error as { message: string }).message);
    }
    else {
      ctx.throw(401, 'Unauthorized');
    }
  }
}
