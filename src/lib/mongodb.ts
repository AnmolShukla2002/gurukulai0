import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!dbName) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    // If a connection is already cached, return it
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new MongoClient instance with modern options
  const client = new MongoClient(uri);

  try {
    // Connect the client to the server
    await client.connect();
    console.log("Successfully connected to MongoDB.");
  } catch (e) {
    console.error("Could not connect to MongoDB.", e);
    // Re-throw the error to be caught by the calling function
    throw e;
  }

  const db = client.db(dbName);

  // Cache the connection for future use
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
