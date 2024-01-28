import { ERC20TokenBalance } from './airstack/types';

export function deduplicateTokens(tokens: ERC20TokenBalance[]) {
  const uniqueTokens: ERC20TokenBalance[] = [];
  const uniqueTokenAddresses: string[] = [];

  tokens.forEach((token) => {
    if (!uniqueTokenAddresses.includes(token.tokenAddress)) {
      uniqueTokens.push(token);
      uniqueTokenAddresses.push(token.tokenAddress);
    }
  });
  return uniqueTokens;
}
