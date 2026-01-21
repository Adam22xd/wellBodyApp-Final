import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import useAuth from "./hooks/useAuth";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useState } from "react";
import stats from "./hooks/RegisterStats";
import FoodModel from "./hooks/FoodModel";
import FoodPanel from "./FoodPanel";
import WaterPanel from "./WaterPanel";
import WaterList from "./WaterList";
import Menu from "./Menu";
import FoodList from "./FoodList";
import Footer from "./Footer";

export default function App() {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);

  // 🔥 JEDYNY STAN PANELI
  const [activePanel, setActivePanel] = useState(null);
  // "food" | "water" | null

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [foodModel, setFoodModel] = useState(null);

  const [waterForm, setWaterForm] = useState({
    name: "",
    amount: "",
  });

  const [waterItems, setWaterItems] = useState([]);

  
  const {
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

    register,
    loginAllFunc,
    logout,
  } = useAuth();

  /* =========LOGIN======*/
  
  const handleLogin = () => {
    if (loginUser()) {
      alert("Zalogowano pomyślnie");
      setIsLoginVisible(false);
    }
  };
  
  /* =========REJESTRACJA======*/


  const handleRegister = () => {
    if (register()) {
      alert("Zarejestrowano pomyślnie");
      stats.showUsersData();
      setName("");
      setSurname("");
      setPasswordReg("");
      setIsRegisterVisible(false);
    }
  };

  // ===== PANELS =====

  const openFoodPanel = () => {
    setFoodModel((prev) => prev ?? new FoodModel());
    setActivePanel("food");
    setIsMenuOpen(false);
  };

  const openWaterPanel = () => {
    setActivePanel("water");
    setIsMenuOpen(false);
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  // ===== FOOD =====

  const addProduct = () => {
    setFoodModel((prev) => {
      if (!prev) return prev;

      const updated = new FoodModel(prev.name, prev.weight, prev.calories);
      updated.history = [...prev.history];

      updated.add(updated.name, updated.weight, updated.calories);

      updated.name = "";
      updated.weight = "";
      updated.calories = "";

      return updated;
    });

    closePanel(); // 🔥 ZAMYKA PANEL
  };

  const updateModel = (field, value) => {
    setFoodModel((prev) => {
      if (!prev) return prev;

      const updated = new FoodModel(prev.name, prev.weight, prev.calories);
      updated.history = [...prev.history];
      updated[field] = value;

      return updated;
    });
  };

  // ===== WATER =====

  const updateWaterForm = (field, value) => {
    setWaterForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addWater = () => {
    setWaterItems((prev) => [...prev, { ...waterForm }]);
    setWaterForm({ name: "", amount: "" });

    closePanel(); // 🔥 ZAMYKA PANEL
    if (!waterForm.name || !waterForm.amount) return;
  };

  // ===== CALORIES =====

  const CALORIES_LIMIT = 2000;

  const totalCaloriesSum =
    foodModel?.history?.reduce(
      (sum, item) => sum + Number(item.calories || 0),
      0
    ) || 0;

  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const caloriesPercent = Math.min(
    (totalCaloriesSum / CALORIES_LIMIT) * 100,
    100
  );

  const strokeDashoffset =
    circumference - (caloriesPercent / 100) * circumference;

  // ======== WODA ============ //

  const WATER_LIMIT = 2000;

  const totalWaterSum = () =>
    waterItems.reduce((sum, item) => sum + Number(item.amount), 0);

  const percentWater = () =>
    Math.min((totalWaterSum() / WATER_LIMIT) * 100, 100);

  const waterStrokeOffset = () =>
    circumference - (percentWater() / 100) * circumference;


  const shouldShowFooter =
    isLoggedIn &&
    activePanel === null &&
    (foodModel?.history?.length > 0 || waterItems.length > 0);







  return (
    <div className="main-icon">
      <nav className="navbar">
        <div className="nav-for-login">
          {isLoggedIn && (
            <>
              <div className="burger-menu">
                <Menu
                  isMenuOpen={isMenuOpen}
                  onFoodSelect={openFoodPanel}
                  onWaterSelect={openWaterPanel}
                  onToggleMenu={() => setIsMenuOpen((p) => !p)}
                />
              </div>
              <a className="titleApp">Aplikacja Fitness</a>
              <button
                className="logout"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                  closePanel();
                }}
              >
                Wyloguj
              </button>
            </>
          )}

          <h1 className="greeting">
            {isLoggedIn && `Witaj, ${login || "użytkowniku"}`}
          </h1>
        </div>

        {!isLoggedIn && (
          <>
            <button
              className="account"
              onClick={() => {
                setIsLoginVisible(!isLoginVisible);
                setIsRegisterVisible(false);
              }}
            >
              Zaloguj się
            </button>

            <button
              className="register"
              onClick={() => {
                setIsRegisterVisible(!isRegisterVisible);
                setIsLoginVisible(false);
              }}
            >
              Zarejestruj się
            </button>
          </>
        )}
      </nav>
     
      {isLoginVisible && (
        <LoginForm
          login={login}
          password={loginPassword}
          setLogin={setLogin}
          setPassword={setLoginPassword}
          onLogin={handleLogin}
        />
      )}
      {isRegisterVisible && (
        <RegisterForm
          name={name}
          surname={surname}
          password={passwordReg}
          setName={setName}
          setSurname={setSurname}
          setPasswordReg={setPasswordReg}
          errors={errors}
          register={handleRegister}
        />
      )}
      {isLoggedIn && (
        <div className="panels-only">
          <div className="panels-row">
            {activePanel === "food" && (
              <FoodPanel
                model={foodModel}
                onClose={closePanel}
                toAdd={addProduct}
                onUpdate={updateModel}
              />
            )}

            {activePanel === "water" && (
              <WaterPanel
                form={waterForm}
                onUpdate={updateWaterForm}
                onAdd={addWater}
                onClose={closePanel}
              />
            )}
          </div>

          {/* 🔥 NOWY KONTENER */}
          <div className="dashboard-grid">
            <div className="waterAndCaloriesCircle">
              <div className="stats-wrapper">
                <div className="calories-summary">
                  Calories
                  <div
                    style={{
                      position: "relative",
                      width: "120px",
                      height: "120px",
                    }}
                  >
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 120 120"
                      style={{ transform: "rotate(-90deg)" }}
                    >
                      <defs>
                        {/* gradient */}
                        <linearGradient
                          id="calGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#ff7a18" />
                          <stop offset="100%" stopColor="#ff3d00" />
                        </linearGradient>

                        {/* cień */}
                        <filter
                          id="shadow"
                          x="-50%"
                          y="-50%"
                          width="200%"
                          height="200%"
                        >
                          <feDropShadow
                            dx="0"
                            dy="2"
                            stdDeviation="4"
                            floodColor="#ff3d00"
                            floodOpacity="0.35"
                          />
                        </filter>
                      </defs>

                      {/* tło */}
                      <circle
                        r={normalizedRadius}
                        cx="60"
                        cy="60"
                        fill="transparent"
                        stroke="#f1f1f1"
                        strokeWidth={stroke}
                      />

                      {/* progress */}
                      <circle
                        r={normalizedRadius}
                        cx="60"
                        cy="60"
                        fill="transparent"
                        stroke="url(#calGradient)"
                        strokeWidth={stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        filter="url(#shadow)"
                        style={{
                          transition:
                            "stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)",
                        }}
                      />
                    </svg>

                    <div
                      className="calories-text"
                      style={{
                        position: "absolute",
                        top: "130%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      {totalCaloriesSum} / {CALORIES_LIMIT} kcal
                    </div>
                  </div>
                </div>
                {/*Woda circle*/}

                <div className="water-summary">
                  Woda
                  <div
                    style={{
                      position: "relative",
                      width: "120px",
                      height: "120px",
                    }}
                  >
                    <svg
                      width="120"
                      height="120"
                      style={{ transform: "rotate(-90deg)" }}
                    >
                      {/* tło */}
                      <circle
                        stroke="#e0e0e0"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                      />

                      {/* progress wody */}
                      <circle
                        stroke="dodgerblue"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={waterStrokeOffset()}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        style={{ transition: "stroke-dashoffset 0.4s ease" }}
                      />
                    </svg>

                    {/* tekst w środku */}
                    <div
                      className="water-text"
                      style={{
                        position: "absolute",
                        top: "130%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      {totalWaterSum()} / {WATER_LIMIT} ml
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {shouldShowFooter && <Footer />}

          {activePanel === null && (
            <div className="products-lists">
              <FoodList items={foodModel?.history} />
              <WaterList items={waterItems} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
