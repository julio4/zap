import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import { AttestContextType } from "../components/context/attestContext";
import { TokenBalance } from "../types";

const ORACLE_ENDPOINT = process.env["ORACLE_ENDPOINT"];

interface UseTokenFetchParams {
  attest: AttestContextType;
  setTokenFetchLoading: Dispatch<SetStateAction<boolean>>;
  setTokenBalances: (
    tokenBalancesEthereum: TokenBalance[],
    tokenBalancesPolygon: TokenBalance[]
  ) => void;
  setError: Dispatch<SetStateAction<string | null>>;
}

const useTokenFetch = ({
  attest,
  setTokenFetchLoading,
  setTokenBalances,
  setError,
}: UseTokenFetchParams) => {
  const getAllTokens = async () => {
    setTokenFetchLoading(true);
    console.log("Getting all tokens");

    try {
      const response = await axios.post(`${ORACLE_ENDPOINT}/listBalances`, {
        address: attest.ethereumWallet.address,
        signature: attest.ethereumWallet.signature,
      });

      const tokenBalancesEthereum = response.data.value[0];
      const tokenBalancesPolygon = response.data.value[1];
      setTokenBalances(tokenBalancesEthereum, tokenBalancesPolygon);
      console.log("Token balancesETH: ", tokenBalancesEthereum);
      console.log("Token balancesPOLY: ", tokenBalancesPolygon);
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setTokenFetchLoading(false);
    }
  };

  return { getAllTokens };
};

export default useTokenFetch;
