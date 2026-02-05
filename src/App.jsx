import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { useState, useEffect } from "react";
import useAuth from "./hooks/useAuth";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

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

  const [activePanel, setActivePanel] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [foodModel, setFoodModel] = useState(null);

  const [waterForm, setWaterForm] = useState({
    name: "",
    amount: "",
  });

  const [waterItems, setWaterItems] = useState([]);

  const {
    email,
    setEmail,
    loginPassword,
    setLoginPassword,
    passwordReg,
    setPasswordReg,
    isLoggedIn,
    register,
    loginUser,
    logout,
  } = useAuth();




  /* ========= LOGIN ========= */

  const handleLogin = async () => {
    const success = await loginUser();
    if (success) {
      alert("Zalogowano pomyślnie");
      setIsLoginVisible(false);
    }
  };

  /* ========= REJESTRACJA ========= */

  const handleRegister = async (email,password) => {
    const success = await register(email,password);
    if (success) {
      alert("Zarejestrowano pomyślnie");
      setIsRegisterVisible(false);
    }

    return success;
  };

  /* ========= PANELS ========= */

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

  /* ========= FOOD ========= */

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

    closePanel();
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

  /* ========= WATER ========= */

  const updateWaterForm = (field, value) => {
    setWaterForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addWater = () => {
    if (!waterForm.name || !waterForm.amount) return;

    setWaterItems((prev) => [...prev, { ...waterForm }]);
    setWaterForm({ name: "", amount: "" });
    closePanel();
  };

  /* ========= UI ========= */

  return (
    <div className="main-icon">
      <nav className="navbar">
        {isLoggedIn === true && (
          <>
            <Menu
              isMenuOpen={isMenuOpen}
              onFoodSelect={openFoodPanel}
              onWaterSelect={openWaterPanel}
              onToggleMenu={() => setIsMenuOpen((p) => !p)}
            />
            <button
              className="logout"
              onClick={() => {
                setIsMenuOpen(false);
                logout();
                closePanel();
              }}
            >
              Wyloguj
            </button>
          </>
        )}

        <h1 className="greeting">
          {isLoggedIn === true && `Witaj, użytkowniku`}
        </h1>

        {!isLoggedIn && (
          <>
            <button
              onClick={() => {
                setIsLoginVisible(true);
                setIsRegisterVisible(false);
              }}
            >
              Zaloguj się
            </button>

            <button
              onClick={() => {
                setIsRegisterVisible(true);
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
          login={email}
          password={loginPassword}
          setLogin={setEmail}
          setPassword={setLoginPassword}
          onLogin={handleLogin}
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

      {isLoggedIn === true && (
        <div className="panels-only">
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
      )}

      {activePanel === null && isLoggedIn && (
        <>
          <FoodList items={foodModel?.history} />
          <WaterList items={waterItems} />
          <Footer />
        </>
      )}
    </div>
  );
}
