import { ERC20TokenBalance, Route } from './airstack/types';
import { Poseidon, Encoding, Field } from 'o1js';

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

export const hashRoute = (route: Route): Field =>
  Poseidon.hash([
    ...Encoding.stringToFields(route.path),
    ...Encoding.stringToFields(JSON.stringify(route.args)),
  ]);
