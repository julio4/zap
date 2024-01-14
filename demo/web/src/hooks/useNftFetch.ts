import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import { AttestContextType } from "../components/context/attestContext";
import { NFTTokenBalance } from "../types";

const ORACLE_ENDPOINT = process.env["ORACLE_ENDPOINT"];

interface UseNftFetchParams {
  attest: AttestContextType;
  setTokenFetchLoading: Dispatch<SetStateAction<boolean>>;
  setNftBalances: (
    NftBalancesEthereum: NFTTokenBalance[],
    NftBalancesPolygon: NFTTokenBalance[]
  ) => void;
  setError: Dispatch<SetStateAction<string | null>>;
}

const useNftFetch = ({
  attest,
  setTokenFetchLoading,
  setNftBalances,
  setError,
}: UseNftFetchParams) => {
  const getAllNFts = async () => {
    setTokenFetchLoading(true);

    try {
      const response = await axios.post(`${ORACLE_ENDPOINT}/listNFTs`, {
        address: attest.ethereumWallet.address,
        signature: attest.ethereumWallet.signature,
      });

      const nftBalancesEthereum = response.data.value[0];
      const nftBalancesPolygon = response.data.value[1];
      setNftBalances(nftBalancesEthereum, nftBalancesPolygon);
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

  return { getAllNFts };
};

export default useNftFetch;
