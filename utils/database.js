import mongoose from "mongoose";
import fs from "fs";
import User from "../models/user.schema.js";
import Album from "../models/album.schema.js";

const databaseName = "spotify-clone";

// data files
// const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
let connection = null;

async function connectDB() {
  try {
    connection = await mongoose.connect(process.env.MONGO_URI, {
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
  } catch (error) {
    console.error("❌ Users upload error:", error);
  }
}

async function updateAlbumSchema() {
  // add an likeCount field to the album schema
  try {
    // Method 1: Using updateMany
    const result = await Album.updateMany(
      { like_count: { $exists: false } },
      { $set: { like_count: 0 } }
    );
    console.log("✅ Album schema updated:", result);
  } catch (error) {
    console.error("❌ Album schema update error:", error);
  }
}

async function updateUserSchema() {
  try {
    const bulkOps = await User.collection.initializeUnorderedBulkOp();
    bulkOps.find({}).update({ $unset: { avatarUrl: 1 } });
    await bulkOps.execute();

    console.log("✅ User schema updated:", result);
  } catch (error) {
    console.error("❌ User schema update error:", error);
  }
}

async function uploadData() {
  // await uploadUsers();
  // await updateAlbumSchema();
  await updateUserSchema();
}

export { connectDB, disconnectDB, uploadData };
