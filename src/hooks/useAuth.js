import { useState } from "react";
import stats from "./RegisterStats";

export default function useAuth() {

  // 🔐 LOGOWANIE
  const [login, setLogin] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 📝 REJESTRACJA
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [passwordReg, setPasswordReg] = useState("");


  /// OBSŁUGA BŁEDÓW
  const [errors, setErrors] = useState({
    name: "",
    surname: "",
    passwordReg: "",
  });


  // ZALOGOWANIE SIĘ

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("login")
  );

  // BŁEDY LOG/REJ
  const [loginError, setLoginError] = useState("");


  // =========================
  // 📝 REJESTRACJA
  // =========================
  const register = () => {
    const newErrors = { name: "", surname: "", passwordReg: "" };
    let hasError = false;

    const cleanName = name.trim();
    const cleanSurname = surname.trim();
    const cleanPassword = passwordReg.trim();

    if (cleanName.length < 3) {
      newErrors.name = "Imię musi mieć co najmniej 3 znaki.";
      hasError = true;
    }

    if (cleanSurname.length < 3) {
      newErrors.surname = "Nazwisko musi mieć co najmniej 3 znaki.";
      hasError = true;
    }

    if (cleanPassword.length < 8) {
      newErrors.passwordReg = "Hasło musi mieć co najmniej 8 znaków.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return false;

    // ✅ zapis użytkownika
    try {
      stats.addUser(cleanName, cleanSurname, cleanPassword);
    } catch (err) {
      alert("Użytkownik już istnieje");
      return false;
    }

    // (opcjonalnie auto-login)
    localStorage.setItem("login", cleanName);
    setIsLoggedIn(true)

    // 🔥 reset formularza
    setName("");
    setSurname("");
    setPasswordReg("");

    return true;
  };

  // =========================
  // 🔐 LOGOWANIE
  // =========================
  const loginUser = () => {
    if (!login.trim() || !loginPassword.trim()) {
      setLoginError("Pola nie mogą być puste");
      return false;
    }

    if (stats.checkLogin(login, loginPassword)) {
      localStorage.setItem("login", login);
      setIsLoggedIn(true);
      setLogin("");
      setLoginPassword("");
      setLoginError("");
      return true;
    }

    setLoginError("Niepoprawny login lub hasło");
    return false;
  };



  // =========================
  // 🚪 WYLOGOWANIE
  // =========================
  const logout = () => {
    localStorage.removeItem("login");
    setIsLoggedIn(false);
  };



  return {
    // logowanie
    login,
    setLogin,
    loginPassword,
    setLoginPassword,

    // rejestracja
    name,
    setName,
    surname,
    setSurname,
    passwordReg,
    setPasswordReg,
    errors,
    isLoggedIn,
    loginUser,
    loginError,
    register,
    logout,
  };
}
