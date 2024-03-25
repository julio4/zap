import("node-fetch").then(({ default: fetch }) => {
  // Votre code utilisant fetch ici
  const rootHash = "uniqueHash";
  const state = { info: "test" };

  // Stocker un état
  fetch("http://localhost:3001/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rootHash, state }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Réponse de POST:", data);

      // Récupérer l'état
      return fetch(`http://localhost:3001/state/${rootHash}`);
    })
    .then((response) => response.json())
    .then((data) => console.log("Réponse de GET:", data))
    .catch((error) => console.error("Erreur:", error));
});
