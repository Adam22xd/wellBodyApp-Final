import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { useState } from "react";
import { useAuthContext } from "./context/AuthContext.jsx";
import { html as beautifyHtml } from "js-beautify";

import LoginForm from "./LoginForm.js";
import RegisterForm from "./RegisterForm.js";

import FoodPanel from "./FoodPanel.js";
import FoodModel from "./hooks/FoodModel";
import WaterPanel from "./WaterPanel.jsx";
import WaterList from "./WaterList.jsx";
import Menu from "./Menu.js";
import Footer from "./Footer.js";


export default function App() {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);

  const [activePanel, setActivePanel] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /*=========FOOD MODEL i TYP ============== */
  const [foodItems, setFoodItems] = useState([]);
  const [newFood, setNewFood] = useState({
    name: "",
    weight: 0,
    calories: 0,
  });

  /* ========== WATER MODEL =========== */
  const [waterItems, setWaterItems] = useState([]);
  const [newWater, setNewWater] = useState({
    name: "",
    amount: "",
  });

  const {
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
  } = useAuthContext();

  /* ========= LOGIN ========= */

  const handleLogin = async () => {
    const success = await loginUser();
    if (success) {
      alert("Zalogowano pomyślnie");
      setIsLoginVisible(false);
    }
  };

  /* ========= REJESTRACJA ========= */

  const handleRegister = async (email, password) => {
    const success = await register(email, password);
    if (success) {
      alert("Zarejestrowano pomyślnie");
      setIsRegisterVisible(false);
    }

    return success;
  };

  /* ========= PANELS ========= */

  /* === CLOSE BUTTON === */

  const closePanel = () => {
    setActivePanel(null);
  };

  /* ======== TOGGLE FOOD BUTTON ============ */

  const toggleFoodPanel = () => {
    setActivePanel((prev) => (prev === "food" ? null : "food"));
  };

  /* ========= FOOD ========= */

  const addProduct = () => {
    if (!newFood.name.trim() || !newFood.weight || !newFood.calories) return;

    setFoodItems((prev) => [...prev, newFood]);

    setNewFood({
      name: "",
      weight: 0,
      calories: 0,
    });
    setActivePanel(null);
  };

  const updateFood = (field, value) => {
    setNewFood((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ========= WATER ========= */
const toggleWaterPanel = () => {
  setActivePanel((prev) => (prev === "water" ? null : "water"));
};

const updateWater = (field, value) => {
  setNewWater((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const addWater = () => {
  if (!newWater.name.trim() || Number(newWater.amount) <= 0) return;

  setWaterItems((prev) => [
    ...prev,
    {
      name: newWater.name.trim(),
      amount: Number(newWater.amount),
    },
  ]);

  setNewWater({ name: "", amount: "" });
  setActivePanel(null);
};

  /* ========= UI ========= */

  return (
    <div className="main-icon">
      <div className="app-wrapper">
        {/* ========= NAVBAR ========= */}
        <nav className="navbar">
          <div className="nav-left">
            <div className="logo">
              <div className="logo-icon">💻</div>
              <span className="logo-text">Fitness List</span>
            </div>
          </div>

          <div className="nav-right">
            {isLoggedIn ? (
              <>
                <span className="user-badge">PL</span>

                <button
                  className="logout-btn"
                  onClick={async () => {
                    console.log("klik");
                    await logout();
                    setIsMenuOpen(false);
                    // alert("klik działa");
                  }}
                >
                  Wyloguj się
                </button>
              </>
            ) : (
              <>
                <button
                  className="log-btn"
                  onClick={() => {
                    setIsLoginVisible(true);
                    setIsRegisterVisible(false);
                  }}
                >
                  <span className="log-title"> Zaloguj </span>
                </button>

                <button
                  className="reg-btn"
                  onClick={() => {
                    setIsRegisterVisible(true);
                    setIsLoginVisible(false);
                  }}
                >
                  <span className="reg-title">Zarejestruj</span>
                </button>
              </>
            )}
          </div>
        </nav>

        {/* HEADER LEPSZY WYGLĄD */}
        {!isLoginVisible && !isRegisterVisible && !isLoggedIn && (
          <header className="hero">
            <div className="hero-left">
              <h1>Kontroluj dietę i nawodnienie</h1>
              <p>
                Prosta aplikacja do monitorowania kalorii i ilości wypitej wody.
              </p>

              {!isLoggedIn && (
                <div className="hero-buttons">
                  <button
                    className="primary-btn"
                    onClick={() => setIsRegisterVisible(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M3 21c0-4 3-7 6-7s6 3 6 7"></path>
                      <line x1="18" y1="8" x2="18" y2="14"></line>
                      <line x1="15" y1="11" x2="21" y2="11"></line>
                    </svg>
                    Zacznij teraz
                  </button>

                  <button class="register-btn">
                    <span onClick={() => setIsLoginVisible(true)}>
                      Zaloguj się
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="hero-right">
              <i className="fa-solid fa-chart-line"></i>
            </div>
          </header>
        )}

        {/* ========= MODAL SYSTEM ========= */}

        {(isLoginVisible || isRegisterVisible) && (
          <div className="modal-wrapper">
            {/* Overlay */}
            <div
              className="overlay"
              onClick={() => {
                setIsLoginVisible(false);
                setIsRegisterVisible(false);
              }}
            />

            {/* Modal Content */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {isLoginVisible && (
                <LoginForm
                  login={email}
                  password={loginPassword}
                  setLogin={setEmail}
                  setPassword={setLoginPassword}
                  onLogin={handleLogin}
                  logout={() => setIsLoginVisible(false)}
                />
              )}

              {isRegisterVisible && (
                <RegisterForm
                  email={email}
                  setEmail={setEmail}
                  passwordReg={passwordReg}
                  setPasswordReg={setPasswordReg}
                  register={handleRegister}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {isLoggedIn && (
        <>
          {/* HEADER */}

          <header className="dashboard-header">
            <h1 className="dashboard-title">Dzisiaj</h1>
          </header>
          <div className="dashboard-cards">
            {/* ======================================================================================================= POSIŁKI ===== */}
            <div className="dashboard-card">
              <h2>Posiłki</h2>
              <div className="card-icon">
                <i className="fa-solid fa-utensils"></i>
              </div>

              <p>
                {foodItems.length
                  ? `${foodItems.length} posiłków`
                  : "Brak posiłków"}
              </p>

              {foodItems.length > 0 && (
                <div className="food-list">
                  {foodItems.map((item, index) => (
                    <div key={index} className="food-item">
                      <strong>{item.name}</strong>
                      <span> {item.weight} g</span>
                      <span> {item.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}

              {activePanel === "food" && (
                <FoodPanel
                  model={newFood}
                  onClose={closePanel}
                  onUpdate={updateFood}
                  onAdd={addProduct}
                />
              )}
              <button className="toggle-btn" onClick={toggleFoodPanel}>
                {" "}
                + Add
              </button>
            </div>

            {/* ============================================================================================================== NAPOJE ===== */}
            <div className="dashboard-card">
              <h2>Napoje</h2>
              <div className="card-icon">
                <i className="fa-solid fa-glass-water"></i>
              </div>

              <p>
                {waterItems.length
                  ? `${waterItems.length} napojów`
                  : "Brak napojów"}
              </p>

              {waterItems.length > 0 && (
                <div className="water-list">
                  {waterItems.map((item, index) => (
                    <div key={index} className="water-item">
                      <strong>{item.name}</strong>
                      <span> {item.amount} ml</span>
                    </div>
                  ))}
                </div>
              )}

              {activePanel === "water" && (
                <WaterPanel
                  form={newWater}
                  onUpdate={updateWater}
                  onAdd={addWater}
                  onClose={closePanel}
                />
              )}

              <button className="toggle-btn" onClick={toggleWaterPanel}>
                + Add
              </button>
            </div>
          </div>

          {/* ===== FLOATING + BUTTON ===== */}
          <button
            className="floating-add-btn"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            +
          </button>
        </>
      )}
    </div>
  );
}
