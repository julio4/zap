const shortenAddress = (address: string, chars = 4) => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

const normalizeAddress = (address: string) => {
  return "0x" + address.slice(2).toUpperCase().normalize();
};

export { shortenAddress, normalizeAddress };
