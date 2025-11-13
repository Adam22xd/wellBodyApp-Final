import { useState, useEffect } from "react";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import WaterSection from "./components/WaterSection";
import CaloriesSection from "./components/CaloriesSection";
import DayPlanning from "./components/DayPlanning";
import RegisterForm from "./components/RegisterForm";
import LoginPanel from "./components/LoginPanel";
import RegisterStats from "./components/RegisterStats";
import Timer from "./Timer";

function App() {
  // ------------------ STANY ------------------
  const [activeSection, setActiveSection] = useState(""); // login/register/menu
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [errors, setErrors] = useState({ name: "", surname: "", password: "" });

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("login") && !!localStorage.getItem("password")
  );

  const [step, setStep] = useState(1);
  const [showMenuUser, setShowMenuUser] = useState(false);


  // --------- Napoje, jedzenie -------//

  const [drinks, setDrinks] = useState([]);
  const [newDrink, setNewDrink] = useState("");

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

    registerStats.addUser(name, surname, password);
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
      setIsLoggedIn(true);
      setIsMenuVisible(true);
      setActiveSection("");
    } else {
      alert("❌ Niepoprawne dane logowania!");
      setIsLoggedIn(false);
      setIsMenuVisible(false);
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

    setIsLoggedIn(false);
    setIsMenuVisible(false);
    setStep(1);
  };

  /* pokaż kolejną sekcje */

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
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
        <button
          className="menuApp"
          onClick={() => {
            setIsMenuVisible((prev) => !prev);
            setActiveSection(""); // zamknij inne sekcje
          }}
        >
          {isMenuVisible ? "Wróć" : "Konto"}
        </button>

        <h1 className="greeting">
          {login ? `Witaj, ${login}!` : "Witaj, użytkowniku"}
        </h1>

        {!isLoggedIn ? (
          <>
            <button
              className="account"
              onClick={() =>
                setActiveSection(activeSection === "login" ? null : "login")
              }
            >
              Zaloguj się
            </button>

            <button
              className="register"
              onClick={() =>
                setActiveSection(
                  activeSection === "register" ? null : "register"
                )
              }
            >
              Zarejestruj się
            </button>
          </>
        ) : (
          <button className="logout" onClick={handleResetLogin}>
            Wyloguj się
          </button>
        )}

        <Timer />
      </nav>

      {/* --- SEKCJE FITNESS --- */}
      {isLoggedIn && step === 1 && (
        <div className="water-section">
          <WaterSection
            water={water}
            waterLimit={waterLimit}
            setWater={setWater}
            getProgress={getProgress}
          />
          <button className="next" onClick={handleNextStep}>
            Dalej
          </button>
        </div>
      )}

      {isLoggedIn && step === 2 && (
        <div className="calories-section">
          <CaloriesSection
            calories={calories}
            setCalories={setCalories}
            calorieLimit={calorieLimit}
            setCalorieLimit={setCalorieLimit}
            getProgress={getProgress}
          />
          <button className="next" onClick={handleNextStep}>
            Dalej
          </button>
        </div>
      )}

      {isLoggedIn && step === 3 && (
        <div className="day-planning">
          <DayPlanning
            water={water}
            waterLimit={waterLimit}
            calories={calories}
            calorieLimit={calorieLimit}
            getProgress={getProgress}
          />
          <button className="next" onClick={handleNextStep}>
            Dalej
          </button>
        </div>
      )}

      {/* --- PANEL LOGOWANIA --- */}
      {activeSection === "login" && !isLoggedIn && (
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
      {activeSection === "register" && !isLoggedIn && (
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


      {/*menu użytkownika dodaj jedznie, napoje*/}
      
      {step === 4 && showMenuUser === false && (
        <header className="user-menu">
          <div className="menu-for-client">
            <button className="btn-plus" >
              &#43;
            </button>{" "}
            <a
              className="text-next-to-btn"
              onClick={() => setShowMenuUser("drinks")}
            >
              Dodaj napoje
            </a>
            <div className="viev-icon-items"></div>
          </div>
          <div className="menu-for-client">
            <button className="btn-plus">
              &#43;
            </button>{" "}
            <a className="text-next-to-btn">Dodaj posiłek</a>
            <div className="viev-icon-items"></div>
          </div>
        </header>
      )}
      {showMenuUser === "drinks" && (
        <div className="drinks-panel">
          <h2>Dodaj napój</h2>

          <input
            type="text"
            value={newDrink}
            onChange={(e) => setNewDrink(e.target.value)}
            placeholder="Wpisz napój..."
          />

          <button
            onClick={() => {
              if (newDrink.trim() !== "") {
                setDrinks([...drinks, newDrink]);
                setNewDrink("");
              }
            }}
          >
            Dodaj
          </button>

          <ul>
            {drinks.map((drink, index) => (
              <li key={index}>{drink}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// const [activeSection, setActiveSection] = useState(""); // login/register/menu
// const [isMenuVisible, setIsMenuVisible] = useState(false);
// const [errors, setErrors] = useState({ name: "", surname: "", password: "" });

// const [isLoggedIn, setIsLoggedIn] = useState(
//   !!localStorage.getItem("login") && !!localStorage.getItem("password")
// );

// const [step, setStep] = useState(1);
// const [showMenuUser, setShowMenuUser] = useState(false);

export default App;
