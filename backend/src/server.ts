import dotenv from "dotenv";
import { app } from "./app";
import { connectMongo } from "./config/mongo";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || "mongodb://localhost:27017/ku_credit_demo";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectMongoWithRetry(uri: string, retryDelayMs = 5000) {
  while (true) {
    try {
      await connectMongo(uri);
      return;
    } catch (err) {
      console.error("⚠️ Mongo connection failed, retrying...", err);
      await sleep(retryDelayMs);
    }
  }
}

async function main() {
  app.listen(PORT, () => console.log(`✅ API on http://localhost:${PORT}`));

  // Keep API available even if MongoDB is temporarily down.
  // Mongo-backed routes will work automatically after reconnection succeeds.
  void connectMongoWithRetry(MONGO_URI);
}

main().catch(err => {
  console.error("❌ Server error:", err);
  process.exit(1);
});
