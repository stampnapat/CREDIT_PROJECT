import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectMongo } from "../src/config/mongo";

jest.setTimeout(30000);

let mongoServer: MongoMemoryServer | null = null;

export async function setupMongoForTests() {
  const useExternalMongo = process.env.USE_EXTERNAL_MONGO_FOR_TESTS === "true";
  const externalMongoUri = process.env.MONGO_URI;

  if (useExternalMongo && externalMongoUri) {
    let lastError: unknown;

    for (let attempt = 1; attempt <= 15; attempt += 1) {
      try {
        await connectMongo(externalMongoUri);
        return;
      } catch (err) {
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw lastError;
  }

  mongoServer = await MongoMemoryServer.create();
  await connectMongo(mongoServer.getUri());
}

export async function teardownMongoForTests() {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}
