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

const isXMTPenabled = (owner: string): number => {
  return randomInt(2);
};

const isEnsHolder = (owner: string): number => {
  return randomInt(2);
};

const isLensHolder = (owner: string): number => {
  return randomInt(2);
};

const isFarcasterHolder = (owner: string): number => {
  return randomInt(2);
};

const getUserNftVolumeSales = (owner: string): number => {
  return randomInt(100000);
};

export default {
  getBalance,
  isPoapHolder,
  isNftHolder,
  isXMTPenabled,
  isEnsHolder,
  isLensHolder,
  isFarcasterHolder,
  getUserNftVolumeSales,
};
