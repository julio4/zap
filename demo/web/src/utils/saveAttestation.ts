// Save attestation to local storage

export function addAttestationNoteToLocalStorage(newNote: string): boolean {
    try {
        console.log("Adding attestation note to local storage", newNote);
        const existingNotesString = localStorage.getItem("attestationNotes");
        const existingNotes: string[] = existingNotesString ? JSON.parse(existingNotesString) : [];

        existingNotes.push(newNote);
        localStorage.setItem("attestationNotes", JSON.stringify(existingNotes));
        return true;
    } catch (error) {
        console.error("Error updating localStorage", error);
        return false;
    }
}
