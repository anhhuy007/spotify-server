import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

const serviceAccountPath = isProduction
  ? "/etc/secrets/spotify-clone-c39ee-firebase-adminsdk-fbsvc-7658bfc9e2.json"
  : path.join(
      process.cwd(),
      "secrets/spotify-clone-c39ee-firebase-adminsdk-fbsvc-7658bfc9e2.json"
    );

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
