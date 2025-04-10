import admin from "firebase-admin";
import serviceAccount from "../secrets/spotify-clone-c39ee-firebase-adminsdk-fbsvc-7658bfc9e2.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;
