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
      value: balance,
      route: "/balance"
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
      value: isHolder,
      route: "/poap"
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
      value: numberNft,
      route: "/nft"
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
      value: isOpen,
      route: "/xmtpEnabled"
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
      value: gotEnsAttached,
      route: "/ens"
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
      value: isOwner,
      route: "/lens"
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
      value: isOwner,
      route: "/farcaster"
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
      value: volumeInEth,
      route: "/totalNftVolume"
    };
  } catch (error) {
    ctx.throw(404);
  }
}
