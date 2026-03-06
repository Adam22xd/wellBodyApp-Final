import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { auth } from "./firebase";

type RegisterResult = {
  ok: boolean;
  code?: string;
};

export default function useAuth() {
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const register = async (
    userEmail: string,
    password: string,
  ): Promise<RegisterResult> => {
    try {
      await createUserWithEmailAndPassword(auth, userEmail, password);
      await signOut(auth);
      return { ok: true };
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      return { ok: false, code: firebaseError.code };
    }
  };

  const loginUser = async (): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, loginPassword);
      return true;
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      console.log("Firebase login error:", firebaseError.code);
      return false;
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
  };
}
