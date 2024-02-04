export type Statement = {
  /* in base58, @see PublicKey.toBase58 */
  sourceKey: string;
  route: string;
  /* Args are currently disabled
     We can add them in ProvableStatement in the near future
  */
  // args: any[] | null;
  condition: {
    /* type: 1: '<' | 2: '>' | 3: '==' | 4: '!='; */
    type: number;
    targetValue: number;
  };
};
