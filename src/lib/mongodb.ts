import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    // If a connection is already cached, return it
    return { client: cachedClient, db: cachedDb };
  }

  if (!uri) {
    throw new Error('The MONGODB_URI environment variable is not defined in the deployment environment.');
  }

  if (!dbName) {
    throw new Error('The MONGODB_DB environment variable is not defined in the deployment environment.');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Successfully connected to MongoDB.");
  } catch (e) {
    console.error("Could not connect to MongoDB.", e);
    throw e;
  }

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
