// Save attestation to local storage
export function addAttestationNoteToLocalStorage(newNote: string): boolean {
  try {
    const existingNotesString = localStorage.getItem("attestationNotes");
    const existingNotes: string[] = existingNotesString
      ? JSON.parse(existingNotesString)
      : [];

    existingNotes.push(newNote);
    localStorage.setItem("attestationNotes", JSON.stringify(existingNotes));
    return true;
  } catch (error) {
    console.error("Error updating localStorage", error);
    return false;
  }
}

export function getAttestationNotesFromLocalStorage(): string[] | null {
  try {
    const notesString = localStorage.getItem("attestationNotes");
    if (notesString) {
      return JSON.parse(notesString);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return null;
  }
}
