import { create } from 'zustand';
import { ZapWorkerClient } from '@zap/client';
import { PublicKey } from 'o1js';

type ZapState = {
    zapWorkerClient: ZapWorkerClient | null;
    hasWallet: boolean | null;
    hasBeenSetup: boolean;
    accountExists: boolean;
    publicKey: PublicKey | null;
    zapPublicKey: PublicKey | null;
    creatingTransaction: boolean;
};

interface ZapActions {
    setZapState: (newState: Partial<ZapState>) => void;
}

type ZapStore = {
    zapState: ZapState;
} & ZapActions;

const useZapStore: () => ZapStore
    = create<ZapStore>((set) => ({
        zapState: {
            zapWorkerClient: null,
            hasWallet: null,
            hasBeenSetup: false,
            accountExists: false,
            publicKey: null,
            zapPublicKey: null,
            creatingTransaction: false,
        },
        setZapState: (newState) => set((state) => ({
            zapState: { ...state.zapState, ...newState },
        })),
    }));

export default useZapStore;