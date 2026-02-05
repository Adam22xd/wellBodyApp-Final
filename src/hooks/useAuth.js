import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from "./firebase";

export default function useAuth() {
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // =====================
  // 📝 REJESTRACJA
  // =====================
  const register = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await signOut(auth);
      return { ok: true };
    } catch (err) {
      return { ok: false, code: err.code };
    }
  };

  // =====================
  // 🔐 LOGOWANIE
  // =====================
  const loginUser = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, loginPassword);
      setIsLoggedIn(true);
      return true;
    } catch (err) {
      console.log("Firebase login error:", err.code);
      return false;
    }
  };

  // =====================
  // 🚪 WYLOGOWANIE
  // =====================
  const logout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
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
