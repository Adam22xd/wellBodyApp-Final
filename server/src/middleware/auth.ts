import type { NextFunction, Request, Response } from "express";
import { adminAuth } from "../firebase/admin";
import { env } from "../config/env";

type ToolkitResult =
  | { ok: true; uid: string; email?: string }
  | { ok: false; reason: string };

async function verifyTokenWithIdentityToolkit(
  token: string,
): Promise<ToolkitResult> {
  if (!env.firebaseWebApiKey) {
    return { ok: false, reason: "FIREBASE_WEB_API_KEY is missing" };
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.firebaseWebApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken: token }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    const reason = `IdentityToolkit ${response.status}: ${errorBody}`;
    console.error(reason);
    return { ok: false, reason };
  }

  const data = await response.json();
  const user = data?.users?.[0];
  if (!user?.localId) {
    return { ok: false, reason: "IdentityToolkit returned no user.localId" };
  }

  return {
    ok: true,
    uid: user.localId as string,
    email: user.email as string | undefined,
  };
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  console.log(
    "Authorization header present:",
    !!authHeader,
    authHeader?.slice(0, 20),
  );
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    return res.status(401).json({ message: "Missing bearer token" });
  }

  const tokenParts = token.split(".");
  if (tokenParts.length === 3) {
    try {
      const payload = JSON.parse(
        Buffer.from(tokenParts[1], "base64url").toString("utf8"),
      );
      console.log("Token claims debug:", {
        aud: payload?.aud,
        iss: payload?.iss,
        sub: payload?.sub,
        envProjectId: env.firebaseProjectId,
      });
    } catch (decodeError) {
      console.error("Token decode failed:", decodeError);
    }
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
    };
    return next();
  } catch (error) {
    console.error("Firebase token verification failed:", error);

    const toolkitResult = await verifyTokenWithIdentityToolkit(token);
    if (toolkitResult.ok) {
      req.user = {
        firebaseUid: toolkitResult.uid,
        email: toolkitResult.email,
      };
      return next();
    }

    const reason = error instanceof Error ? error.message : "unknown";
    return res.status(401).json({
      message: `Invalid token: ${reason}. Fallback: ${toolkitResult.reason}`,
    });
  }
}
