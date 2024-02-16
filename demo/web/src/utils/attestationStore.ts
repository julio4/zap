import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AttestationState {
  attestationNotes: string[];
  addAttestationNote: (newNote: string) => void;
}

export const useAttestationStore = create<AttestationState>()(
  persist(
    (set, get) => ({
      attestationNotes: [],
      addAttestationNote: (newNote: string) =>
        set({
          attestationNotes: [...get().attestationNotes, newNote],
        }),
    }),
    {
      name: "attestationNotes-storage", // unique name for the storage entry
    }
  )
);

export const addNote = (newNote: string) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString();
  const noteWithDate = `${formattedDate}: ${newNote}`;

  useAttestationStore.getState().addAttestationNote(noteWithDate);
};
