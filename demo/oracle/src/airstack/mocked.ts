import { randomInt } from 'crypto';

const getBalance = (): number => {
  return randomInt(100000);
};

const isPoapHolder = (): number => {
  return randomInt(2);
};

const isNftHolder = (): number => {
  return randomInt(3);
};

const isXMTPenabled = (): number => {
  return randomInt(2);
};

const isEnsHolder = (): number => {
  return randomInt(2);
};

const isLensHolder = (): number => {
  return randomInt(2);
};

const isFarcasterHolder = (): number => {
  return randomInt(2);
};

const getUserNftVolumeSales = (): number => {
  return randomInt(100000);
};

const exportObject = {
  getBalance,
  isPoapHolder,
  isNftHolder,
  isXMTPenabled,
  isEnsHolder,
  isLensHolder,
  isFarcasterHolder,
  getUserNftVolumeSales,
};

export default exportObject;
