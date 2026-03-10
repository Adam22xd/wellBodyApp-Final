import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "../config/env";

function normalizePrivateKey(value: string) {
  return value
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n");
}

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
        privateKey: normalizePrivateKey(env.firebasePrivateKey!),
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
