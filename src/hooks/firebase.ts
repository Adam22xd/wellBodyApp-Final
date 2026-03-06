import { initializeApp, type FirebaseOptions } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCdtR-WTWftSIbcWdqA7U9VQmlTN4i9GgY",
  authDomain: "wellbody-app-728db.firebaseapp.com",
  projectId: "wellbody-app-728db",
  storageBucket: "wellbody-app-728db.appspot.com",
  messagingSenderId: "845092632226",
  appId: "1:845092632226:web:ac6f5de08003c9868ac9fb",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence ustawione");
  })
  .catch((err: unknown) => {
    console.error("Persistence error:", err);
  });
