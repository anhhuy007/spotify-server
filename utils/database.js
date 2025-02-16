import mongoose from "mongoose";
import fs from "fs";
import User from "../models/user.schema.js";

const databaseName = "spotify-clone";

// data files
const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: databaseName,
    });
    console.log("✅ Connected to MongoDB:", databaseName);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log("✅ Disconnected from MongoDB:", databaseName);
  } catch (error) {
    console.error("❌ MongoDB disconnection error:", error);
  }
}

async function uploadUsers() {
  const collectionName = User.collection.name;
  console.log("📚 Collection name:", collectionName);
  console.log("✅ Uploading users to MongoDB...");

  await User.collection.dropIndexes();
  await User.syncIndexes();

  // read the JSON file
  try {
    await User.insertMany(users);
    console.log("✅ Users uploaded to MongoDB");
  }
  catch (error) {
    console.error("❌ Users upload error:", error);
  }
}

async function uploadData() {
  // await uploadUsers(); 
} 

export { connectDB, disconnectDB, uploadData };
