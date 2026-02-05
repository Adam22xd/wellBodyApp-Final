import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// analytics jest opcjonalne – możesz dodać później

const firebaseConfig = {
    apiKey: "AIzaSyCdtR-WTWftSIbcWdqA7U9VQmlTN4i9GgY",
    authDomain: "wellbody-app-728db.firebaseapp.com",
    projectId: "wellbody-app-728db",
    storageBucket: "wellbody-app-728db.appspot.com",
    messagingSenderId: "845092632226",
    appId: "1:845092632226:web:ac6f5de08003c9868ac9fb",
};

const app = initializeApp(firebaseConfig);

// 🔥 TO JEST KLUCZOWA LINIJKA
export const auth = getAuth(app);
