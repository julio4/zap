import { ZapWorkerClient } from "@zap/client";
import { PublicKey } from "o1js";

type ZapState = {
  zapWorkerClient: ZapWorkerClient | null;
  hasWallet: boolean | null;
  hasBeenSetup: boolean;
  accountExists: boolean;
  // currentNum: null | Field,
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

export type { ZapState, ZapActions, ZapStore };