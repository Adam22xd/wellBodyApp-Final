import { useState } from "react";
import stats from "./RegisterStats";





export default function useAuth() {



  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [surname, setSurname] = useState(localStorage.getItem("surname") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");

  const [errors, setErrors] = useState({
    name: "",
    surname: "",
    password: "",
  });



  

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("login") && !!localStorage.getItem("password")
  );

  const register = () => {
    const newErrors = { name: "", surname: "", password: "" };
    let hasError = false;

    if (!name.trim() || name.length < 3) {
      newErrors.name = "Imię musi mieć co najmniej 3 znaki.";
      hasError = true;
    }

    if (!surname.trim() || surname.length < 3) {
      newErrors.surname = "Nazwisko musi mieć co najmniej 3 znaki.";
      hasError = true;
    }

    if (!password.trim() || password.length < 8) {
      newErrors.password = "Hasło musi mieć co najmniej 8 znaków.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return false;


    // 👍 zapisujemy użytkownika
    stats.addUser(name, surname, password);

    console.log(stats.users.length);
    
    // 👍 zapisujemy login – MUSI BYĆ!
    localStorage.setItem("login", name);
    localStorage.setItem("password", password);

    return true;
  };


  const loginUser = () => {
    if (stats.checkLogin(login, password)) {
      localStorage.setItem("login", login);
      localStorage.setItem("password", password);
      setIsLoggedIn(true);            
      return true;
    }
    return false;
  };

  

  const logout = () => {
    localStorage.removeItem("login");
    localStorage.removeItem("password");
    setLogin("");
    setPassword("");
    setIsLoggedIn(false);
    
  };




  const loginAllFunc = () => {
    if(!login.trim()) {
      alert("Login jest pusty")
      return false;
    } 
    if(!password.trim()) {
      alert("hasło jest puste")
      return false;
    } 
    if(loginUser()) {
      return true;
    } else {
      alert ("NIepoprawne dane logowania");
      return false;
    }
  }


  return {
    login,
    setLogin,
    password,
    setPassword,
    name,
    setName,
    surname,
    setSurname,
    email,
    setEmail,
    errors,
    isLoggedIn,
    register,
    loginUser,
    logout,
    loginAllFunc,
  };
}
