import { randomInt } from 'crypto';

const getBalance = (owner: string, token: string): string => {
  return randomInt(100000).toString();
};

export default {
  getBalance,
};
