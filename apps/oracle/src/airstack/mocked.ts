import { randomInt } from 'crypto';

const getBalance = (owner: string, token: string): string => {
  return randomInt(100000).toString();
};

const isPoapHolder = (owner: string, poapId: string): string => {
  return randomInt(2).toString();
};

const isNftHolderETH = (owner: string, nftAddress: string): string => {
  return randomInt(2).toString();
};

const isNftHolderPolygon = (owner: string, nftAddress: string): string => {
  return randomInt(2).toString();
};

export default {
  getBalance,
  isPoapHolder,
  isNftHolderETH,
  isNftHolderPolygon,
};
