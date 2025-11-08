import { useState, useEffect } from "react";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import WaterSection from "./components/WaterSection";
import CaloriesSection from "./components/CaloriesSection";
import DayPlanning from "./components/DayPlanning";
import RegisterForm from "./components/RegisterForm";
import LoginPanel from "./components/LoginPanel";
import RegisterStats from "./components/registerStats";

function App() {
  // ------------------ STANY ------------------
  const [activeSection, setActiveSection] = useState(""); // login/register/menu
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [errors, setErrors] = useState({ name: "", surname: "", password: "" });

  // Dane logowania
  const [login, setLogin] = useState(() => localStorage.getItem("login") || "");
  const [password, setPassword] = useState(
    () => localStorage.getItem("password") || ""
  );

  // Dane rejestracji
  const [name, setName] = useState(() => localStorage.getItem("name") || "");
  const [surname, setSurname] = useState(
    () => localStorage.getItem("surname") || ""
  );
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");

  // ------------------ HOOK PERSISTENT STATE ------------------
  const usePersistentState = (key, defaultValue) => {
    const [value, setValue] = useState(() => {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    });

    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
  };

  // Dane fitness
  const [water, setWater] = usePersistentState("water", 0);
  const [waterLimit, setWaterLimit] = usePersistentState("waterLimit", 3);
  const [calories, setCalories] = usePersistentState("calories", 0);
  const [calorieLimit, setCalorieLimit] = usePersistentState(
    "calorieLimit",
    400
  );

  // ------------------ FUNKCJE ------------------

  const registerStats = new RegisterStats();

  const handleRegister = () => {
    const newErrors = { name: "", surname: "", password: "" };
    let hasError = false;

    if (name.trim() === "") {
      newErrors.name = "Imię jest wymagane.";
      hasError = true;
    } else if (name.trim().length < 3) {
      newErrors.name = "Imię musi mieć co najmniej 3 znaki.";
      hasError = true;
    }

    if (surname.trim() === "") {
      newErrors.surname = "Nazwisko jest wymagane.";
      hasError = true;
    } else if (surname.trim().length < 3) {
      newErrors.surname = "Nazwisko musi mieć co najmniej 3 znaki.";
      hasError = true;
    }

    if (password.trim() === "") {
      newErrors.password = "Hasło jest wymagane.";
      hasError = true;
    } else if (password.trim().length < 8) {
      newErrors.password = "Hasło musi mieć co najmniej 8 znaków.";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return; // zatrzymuje, jeśli są błędy

    registerStats.addUser(name, password, email);
    alert("✅ Konto zostało utworzone!");
    registerStats.showUsersData();

    // wyczyszczenie formularza
    setName("");
    setSurname("");
    setPassword("");
    setErrors({ name: "", surname: "", password: "" });
  };

  const handleSaveLogin = () => {
    if (login.trim() === "" || password.trim() === "") {
      alert("✖️ Podaj swoje dane!");
      return;
    }

    const success = registerStats.checkLogin(login, password);

    if (success) {
      localStorage.setItem("login", login);
      localStorage.setItem("password", password);
      alert("✅ Zalogowano pomyślnie!");
      setActiveSection("");
    } else {
      alert("❌ Niepoprawne dane logowania!");
    }
  };

  const handleResetLogin = () => {
    localStorage.removeItem("login", login);
    localStorage.removeItem("password", password);
    setLogin("");
    setPassword("");
    alert("🔄 Dane logowania zostały zresetowane.");

    if (registerStats !== registerStats.addUser()) {
      console.log("nie istnieje taki uzytkownik");
    }

    registerStats.showUsersData();
  };

  const getProgress = (current, limit) => {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
  };

  useEffect(() => {
    if (activeSection !== "") setIsMenuVisible(false);
  }, [activeSection]);

  // ------------------ JSX ------------------
  return (
    <div className="main-icon">
      <nav className="navbar">
        {/* Przycisk menu */}
        <button
          className="menuApp"
          onClick={() => {
            setIsMenuVisible((prev) => !prev);
            setActiveSection(""); // zamknij inne sekcje
          }}
        >
          {isMenuVisible ? "Wróć" : "Konto"}
        </button>

        {/* Powitanie */}
        <h1 className="greeting">
          {login ? `Witaj, ${login}!` : "Witaj, użytkowniku"}
        </h1>

        {/* Przycisk logowania */}
        <button
          className="account"
          onClick={() =>
            setActiveSection(
              activeSection === "rejestrboard" ? null : "rejestrboard"
            )
          }
        >
          Zaloguj się
        </button>

        {/* Przycisk rejestracji */}
        <button
          className="register"
          onClick={() =>
            setActiveSection(activeSection === "register" ? null : "register")
          }
        >
          Zarejestruj się
        </button>
      </nav>

      {/* --- MENU FITNESS --- */}
      <div className="cards">
        {isMenuVisible && (
          <>
            <WaterSection
              water={water}
              waterLimit={waterLimit}
              setWater={setWater}
              getProgress={getProgress}
            />

            <CaloriesSection
              calories={calories}
              calorieLimit={calorieLimit}
              setCalorieLimit={setCalorieLimit}
              getProgress={getProgress}
            />

            <DayPlanning
              water={water}
              waterLimit={waterLimit}
              calories={calories}
              calorieLimit={calorieLimit}
              getProgress={getProgress}
            />
          </>
        )}
      </div>

      {/* --- PANEL LOGOWANIA --- */}
      {activeSection === "rejestrboard" && (
        <LoginPanel
          login={login}
          setLogin={setLogin}
          password={password}
          setPassword={setPassword}
          handleSaveLogin={handleSaveLogin}
          handleResetLogin={handleResetLogin}
        />
      )}

      {/* --- FORMULARZ REJESTRACJI --- */}
      {activeSection === "register" && (
        <RegisterForm
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          surname={surname}
          setSurname={setSurname}
          password={password}
          setPassword={setPassword}
          handleRegister={handleRegister}
          errors={errors}
        />
      )}
    </div>
  );
}

export default App;
