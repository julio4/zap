import app from "./app.js";
import 'dotenv/config'

if (!process.env.PRIVATE_KEY) {
  throw new Error("Missing PRIVATE_KEY env variable (see .env.example)");
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`ZAP Source is running on port ${port}`);
});
