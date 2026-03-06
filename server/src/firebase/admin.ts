import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "../config/env";

function initFirebaseAdmin() {
  if (getApps().length > 0) {
    return;
  }

  const hasServiceAccount =
    !!env.firebaseProjectId &&
    !!env.firebaseClientEmail &&
    !!env.firebasePrivateKey;

  if (hasServiceAccount) {
    initializeApp({
      credential: cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey!.replace(/\\n/g, "\n"),
      }),
    });
    return;
  }

  initializeApp({
    credential: applicationDefault(),
    projectId: env.firebaseProjectId,
  });
}

initFirebaseAdmin();

export const adminAuth = getAuth();
