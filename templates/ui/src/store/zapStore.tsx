import { create } from 'zustand';
import { ZapState, ZapActions, ZapStore } from '../types';

const useZapStore = create<ZapStore>((set) => ({
    zapState: {
        zapWorkerClient: null,
        hasWallet: null,
        hasBeenSetup: false,
        accountExists: false,
        publicKey: null,
        zapPublicKey: null,
        creatingTransaction: false,
    },
    setZapState: (newState: Partial<ZapState>) => set(({ zapState }) => ({ zapState: { ...zapState, ...newState } })),
}));

export default useZapStore;