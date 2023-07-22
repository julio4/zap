import { ParameterizedContext } from 'koa';
import {
  getBalance,
  getNftSaleVolume,
  isEnsHolder,
  isFarcasterHolder,
  isLensHolder,
  isNftHolder,
  isPoapHolder,
  isXMTPenabled,
} from './airstack/index.js';

export async function getUserBalance(ctx: ParameterizedContext) {
  try {
    const { address, args } = ctx.state;
    const { token, blockchain } = args;
    const balance = await getBalance(address, token, blockchain);

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
    const { event_id } = args;
    const isHolder = await isPoapHolder(address, event_id);

    ctx.body = {
      isHolder,
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

export async function verifyXMTPenabled(ctx: ParameterizedContext) {
  try {
    const { address } = ctx.state;
    const isOpen = await isXMTPenabled(address);

    ctx.body = {
      isOpen,
      // TODO IMPORTANT /!\ mettre la hashroute
    };
  } catch (error) {
    ctx.throw(404);
  }
}

export async function verifyEnsHolder(ctx: ParameterizedContext) {
  try {
    const { address } = ctx.state;
    const gotEnsAttached = await isEnsHolder(address);

    ctx.body = {
      gotEnsAttached,
      // TODO IMPORTANT /!\ mettre la hashroute
    };
  } catch (error) {
    ctx.throw(404);
  }
}

export async function verifyLensHolder(ctx: ParameterizedContext) {
  try {
    const { address } = ctx.state;
    const isOwner = await isLensHolder(address);

    ctx.body = {
      isOwner,
      // TODO IMPORTANT /!\ mettre la hashroute
    };
  } catch (error) {
    ctx.throw(404);
  }
}

export async function verifyFarcasterHolder(ctx: ParameterizedContext) {
  try {
    const { address } = ctx.state;
    const isOwner = await isFarcasterHolder(address);

    ctx.body = {
      isOwner,
      // TODO IMPORTANT /!\ mettre la hashroute
    };
  } catch (error) {
    ctx.throw(404);
  }
}

export async function getUserNftVolumeSales(ctx: ParameterizedContext) {
  try {
    const { address } = ctx.state;
    const volumeInEth = await getNftSaleVolume(address);

    ctx.body = {
      volumeInEth,
      // TODO IMPORTANT /!\ mettre la hashroute
    };
  } catch (error) {
    ctx.throw(404);
  }
}
