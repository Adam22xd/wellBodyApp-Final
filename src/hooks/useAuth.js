import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "./firebase";

export default function useAuth() {
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(null);


    // ✅ Synchronizacja z Firebase (najważniejsza poprawka)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);


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
