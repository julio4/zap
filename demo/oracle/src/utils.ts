import { TokenBalance } from "./airstack/types";

export function deduplicateTokens(tokens: TokenBalance[]) {
    const uniqueTokens: TokenBalance[] = [];
    const uniqueTokenAddresses: string[] = [];

    tokens.forEach((token) => {

      if (!uniqueTokenAddresses.includes(token.tokenAddress)) {
        uniqueTokens.push(token);
        uniqueTokenAddresses.push(token.tokenAddress);
      }
    });
    return uniqueTokens;
  }

