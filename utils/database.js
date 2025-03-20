import mongoose from "mongoose";
import User from "../models/user.schema.js";
import Album from "../models/album.schema.js";
import Song from "../models/song.schema.js";
import Artist from "../models/artist.schema.js";

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

async function updateUserSchema() {
  try {
    console.log("🔄 Updating User schema...");
    const users = await User.find();
    console.log(`Found ${users.length} users to update`);

    for (const user of users) {
      if (users.dob && user.dob.getTime() !== new Date(user.createdAt).getTime()) {
        continue;
      }

      // random date of birth between 1970 and 2000
      const dob = new Date(
        new Date(1970, 0, 1).getTime() +
          Math.random() *
            (new Date(2000, 0, 1).getTime() - new Date(1970, 0, 1).getTime())
      );
    
      await User.updateOne({ _id: user._id }, { $set: { dob } });
    }

    console.log("✅ User schema updated:");
  } catch (error) {
    console.error("❌ User schema update error:", error);
  }
}

async function updateAlbumSchema() {
  try {
    const albums = await Album.find();
    for (const album of albums) {
      if (album.like_count && album.like_count !== 0) {
        continue;
      }

      // generate random play count between 0 and 1000
      const playCount = Math.floor(Math.random() * 1001);
      album.like_count = playCount;
      await album.save();
    }

    console.log("✅ Album data updated successfully");
  } catch (error) {
    console.error("❌ Album data update error:", error);
  }
}

async function updateAlbumReleaseDate() {
  try {
    const albums = await Album.find();
    for (const album of albums) {
      // generate a random release date from 2020 to 2024
      const releaseDate = new Date(
        new Date(2020, 0, 1).getTime() +
          Math.random() *
            (new Date(2024, 0, 1).getTime() - new Date(2020, 0, 1).getTime())
      );
      album.release_date = releaseDate;
      await album.save();

      console.log("Album:", album.title);
      console.log("Release Date:", releaseDate);
    }

    console.log("✅ Album release dates updated successfully");
  } catch (error) {
    console.error("❌ Album release date update error:", error);
  }
}

async function updateSongSchema() {
  try {
    const songs = await Song.find();
    console.log(`Found ${songs.length} songs to update`);
    for (const song of songs) {
      if (song.like_count && song.like_count !== 0) {
        continue;
      }
      
      // generate random like count between 0 and 100
      const likeCount = Math.floor(Math.random() * 101);
      song.like_count = likeCount;
      await song.save(); 
    }

    console.log("✅ Song schema updated");
  } catch(error) {
    console.error("❌ Song schema update error:", error);
  }
}

async function uploadData() {
  // await uploadUsers();
  // await updateAlbumSchema();
  // await updateAlbumReleaseDate();
  // await updateUserSchema();
  // updateSongSchema();
}

export { connectDB, disconnectDB, uploadData };
