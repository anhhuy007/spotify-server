<<<<<<< HEAD
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
=======
import admin from 'firebase-admin';
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(
    "./secrets/spotify-clone-c39ee-firebase-adminsdk-fbsvc-7658bfc9e2.json",
    "utf8"
  )
);


admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
>>>>>>> 8a0c35c951c4a4f9514628c4b63266fd7d4d6094
});

export default admin;
