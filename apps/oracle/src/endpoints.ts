import { ParameterizedContext } from 'koa';
import { getBalance, isNftHolder, isPoapHolder } from './airstack/index.js';

export async function getUserBalance(ctx: ParameterizedContext) {
  try {
    const { address, args } = ctx.state;
    const { tokenAddress, blockchain } = args;
    const balance = await getBalance(address, tokenAddress, blockchain);

    ctx.body = {
      balance,
      // TODO IMPORTANT /!\ mettre la hashroute
    };
  } catch (error) {
    ctx.throw(404);
  }
}

export async function verifyPoapHolder(ctx: ParameterizedContext) {
  try {
    const { address, args } = ctx.state;
    const { eventId } = args;
    const addressFetched = await isPoapHolder(address, eventId);

    const poapHeld = addressFetched == address ? 1 : 0;

    ctx.body = {
      poapHeld,
      // TODO IMPORTANT /!\ mettre la hashroute
    };
  } catch (error) {
    ctx.throw(404);
  }
}

export async function verifyNftHolder(ctx: ParameterizedContext) {
  try {
    const { address, args } = ctx.state;
    const { nftAddress, blockchain } = args;
    const numberNft = await isNftHolder(address, nftAddress, blockchain);

    ctx.body = {
      numberNft,
      // TODO IMPORTANT /!\ mettre la hashroute
    };
  } catch (error) {
    ctx.throw(404);
  }
}