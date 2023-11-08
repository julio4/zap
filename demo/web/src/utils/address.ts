import { ethers } from 'ethers';

const shortenAddress = (address: string, chars = 4) => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

const normalizeAddress = (address: string) => {
  return ethers.getAddress(address)
};

export { shortenAddress, normalizeAddress };
