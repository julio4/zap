export type AirstackTokenBalance = {
  TokenBalance: {
    formattedAmount: number;
  } | null;
};

export type AirstackResponse<T> = {
  data: T;
};
