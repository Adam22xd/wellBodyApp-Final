import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { existsSync, readFileSync } from "node:fs";
import { env } from "../config/env";

function normalizePrivateKey(value: string) {
  return value
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n");
}

function readServiceAccountFile() {
  if (!existsSync(env.firebaseServiceAccountPath)) {
    return null;
  }

  const raw = readFileSync(env.firebaseServiceAccountPath, "utf8");
  const parsed = JSON.parse(raw) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error("Firebase service account file is missing required fields");
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: normalizePrivateKey(parsed.private_key),
  };
}

function initFirebaseAdmin() {
  if (getApps().length > 0) {
    return;
  }

  const serviceAccountFile = readServiceAccountFile();

  if (serviceAccountFile) {
    initializeApp({
      credential: cert(serviceAccountFile),
      projectId: serviceAccountFile.projectId,
    });
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
