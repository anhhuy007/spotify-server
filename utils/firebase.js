import fs from "fs";
import path from "path";
import admin from "firebase-admin";

const serviceAccountPath = path.resolve(
  "secrets",
  "spotify-clone-c39ee-firebase-adminsdk-fbsvc-7658bfc9e2.json"
);
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
