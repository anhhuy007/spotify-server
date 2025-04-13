import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(
    "etc/secrets/spotify-clone-c39ee-firebase-adminsdk-fbsvc-7658bfc9e2.json",
    "utf8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
