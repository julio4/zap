import { ParameterizedContext } from 'koa';
import { getBalance } from './airstack/index.js';

export async function getUserBalance(ctx: ParameterizedContext) {
  try {
    const { address, args } = ctx.state;
    const { tokenAddress } = args;
    const balance = await getBalance(address, tokenAddress);

    ctx.body = {
      balance,
      // TODO IMPORTANT /!\ mettre la hashroute
    };
  } catch (error) {
    ctx.throw(404);
  }
}

// TODO ADD MORE ENDPOINTS
