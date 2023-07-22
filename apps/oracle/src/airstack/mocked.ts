import { randomInt } from 'crypto';

const getBalance = (owner: string, token: string): number => {
  return randomInt(100000);
};

const isPoapHolder = (owner: string, poapId: string): number => {
  return randomInt(2);
};

const isNftHolder = (owner: string, nftAddress: string): number => {
  return randomInt(3);
};

export default {
  getBalance,
  isPoapHolder,
  isNftHolder,
};
