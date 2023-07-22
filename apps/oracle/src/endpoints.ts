import { ParameterizedContext } from 'koa';
import { getBalance, isNftHolderETH, isNftHolderPolygon, isPoapHolder } from './airstack/index.js';

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

export async function verifyNftHolderETH(ctx: ParameterizedContext) {
  try {
    const { address, args } = ctx.state;
    const { nftAddress } = args;
    const addressFetched = await isNftHolderETH(address, nftAddress);

    const nftHeld = addressFetched ? 1 : 0;

    ctx.body = {
      nftHeld,
      // TODO IMPORTANT /!\ mettre la hashroute
    };
  } catch (error) {
    ctx.throw(404);
  }
}

export async function verifyNftHolderPolygon(ctx: ParameterizedContext) {
  try {
    const { address, args } = ctx.state;
    const { nftAddress } = args;
    const addressFetched = await isNftHolderPolygon(address, nftAddress);

    const nftHeld = addressFetched == address ? 1 : 0;

    ctx.body = {
      nftHeld,
      // TODO IMPORTANT /!\ mettre la hashroute
    };
  } catch (error) {
    ctx.throw(404);
  }
}