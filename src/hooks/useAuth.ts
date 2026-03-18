import { useEffect, useState } from "react";
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { auth } from "./firebase";

type RegisterResult = {
  ok: boolean;
  code?: string;
};

type LoginResult = {
  ok: boolean;
  code?: string;
  reason?: "email-not-verified";
};

export default function useAuth() {
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoggedIn(!!user);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const register = async (
    userEmail: string,
    password: string,
  ): Promise<RegisterResult> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userEmail,
        password,
      );

      await sendEmailVerification(userCredential.user);
      await signOut(auth);

      return { ok: true };
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      console.log("Firebase registration error:", firebaseError.code);
      return { ok: false, code: firebaseError.code };
    }
  };

  const loginUser = async (): Promise<LoginResult> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        loginPassword,
      );

      await userCredential.user.reload();

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        return { ok: false, reason: "email-not-verified" };
      }

      return { ok: true };
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      console.log("Firebase login error:", firebaseError.code);
      return { ok: false, code: firebaseError.code };
    }
  };

  const logout = async () => {
    console.log("logout start");
    await signOut(auth);
    console.log("logout DONE");
  };

  return {
    email,
    setEmail,
    loginPassword,
    setLoginPassword,
    passwordReg,
    setPasswordReg,
    register,
    loginUser,
    logout,
    isLoggedIn,
    currentUser,
    authReady,
  };
}
