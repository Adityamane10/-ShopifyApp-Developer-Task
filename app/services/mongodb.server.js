import mongoose from "mongoose";

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}
