import { create, StoreApi, UseBoundStore } from "zustand";
import { ZapState, ZapStore } from "../types";

const useZapStore: UseBoundStore<StoreApi<ZapStore>> = create<ZapStore>(
  (set) => ({
    zapState: {
      zapWorkerClient: null,
      hasWallet: null,
      hasBeenSetup: false,
      accountExists: false,
      publicKey: null,
      zapPublicKey: null,
      creatingTransaction: false,
    },
    setZapState: (newState: Partial<ZapState>) =>
      set(({ zapState }) => ({ zapState: { ...zapState, ...newState } })),
  })
);

export default useZapStore;
