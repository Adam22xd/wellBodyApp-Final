import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "./context/AuthContext.jsx";
import BarcodeScanner from "./BarcodeScanner";
import { auth } from "./hooks/firebase";
import { onAuthStateChanged } from "firebase/auth";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

import FoodPanel from "./FoodPanel";
import WaterPanel from "./WaterPanel";

const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:4001/api" : "/api");

export default function App() {
  useEffect(() => {
    console.log("Using API_URL:", API_URL);
  }, []);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);

  const [activePanel, setActivePanel] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /*=========FOOD MODEL i TYP ============== */
  const [foodItems, setFoodItems] = useState([]);
  const [newFood, setNewFood] = useState({
    name: "",
    weight: "",
    calories: "",
  });

  /* ========== WATER MODEL =========== */
  const [waterItems, setWaterItems] = useState([]);
  const [newWater, setNewWater] = useState({
    name: "",
    amount: "",
  });

  /* ==== BAR CODE ========= */

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [detectedProduct, setDetectedProduct] = useState(null);

  const [manualEntry, setManualEntry] = useState(false);

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

  const getFirebaseToken = useCallback(async () => {
    if (auth.currentUser) {
      return auth.currentUser.getIdToken(true);
    }

    const user = await new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          resolve(firebaseUser);
          return;
        }
        reject(new Error("Brak aktywnej sesji użytkownika"));
      });
    });

    return user.getIdToken(true);
  }, []);

  const authFetch = useCallback(async (path, options = {}) => {
    const token = await getFirebaseToken();
    console.log("authFetch token acquired:", !!token, path);
    const headers = {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    };

    try {
      return await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
      });
    } catch {
      throw new Error(
        "Brak połączenia z API. Ustaw poprawne VITE_API_URL dla produkcji.",
      );
    }
  }, [getFirebaseToken]);

  const loadFoodItems = useCallback(async () => {
    const response = await authFetch("/food");
    if (!response.ok) {
      throw new Error("Nie udało się pobrać posiłków");
    }
    const data = await response.json();
    setFoodItems(Array.isArray(data) ? data : []);
  }, [authFetch]);

  const loadWaterItems = useCallback(async () => {
    const response = await authFetch("/water");
    if (!response.ok) {
      throw new Error("Nie udało się pobrać napojów");
    }
    const data = await response.json();
    setWaterItems(Array.isArray(data) ? data : []);
  }, [authFetch]);

  const getErrorMessage = async (response, fallbackMessage) => {
    try {
      const text = await response.text();
      if (!text) return `${fallbackMessage} (HTTP ${response.status})`;
      try {
        const parsed = JSON.parse(text);
        if (parsed?.message) {
          return `${parsed.message} (HTTP ${response.status})`;
        }
      } catch {
        return `${text} (HTTP ${response.status})`;
      }
      return `${fallbackMessage} (HTTP ${response.status})`;
    } catch {
      return fallbackMessage;
    }
  };

  const getTimeFrameLabel = (dateValue) => {
    if (!dateValue) return "Brak godziny";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Brak godziny";

    const hour = date.getHours();

    if (hour >= 6 && hour < 10) return "Śniadanie (6:00-10:00)";
    if (hour >= 10 && hour < 14) return "Obiad (10:00-14:00)";
    if (hour >= 14 && hour < 16) return "Podwieczorek (14:00-16:00)";
    if (hour >= 16 && hour < 19) return "Kolacja (16:00-19:00)";

    return "Poza planem";
  };

  const formatAddedTime = (dateValue) => {
    if (!dateValue) return "--:--";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "--:--";
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      if (!isLoggedIn) {
        setFoodItems([]);
        setWaterItems([]);
        return;
      }

      try {
        const [meRes, foodRes, waterRes] = await Promise.all([
          authFetch("/auth/me"),
          authFetch("/food"),
          authFetch("/water"),
        ]);

        if (!meRes.ok || !foodRes.ok || !waterRes.ok) {
          throw new Error("Nie udało się pobrać danych");
        }

        const [, foodData, waterData] = await Promise.all([
          meRes.json(),
          foodRes.json(),
          waterRes.json(),
        ]);

        if (cancelled) return;
        setFoodItems(Array.isArray(foodData) ? foodData : []);
        setWaterItems(Array.isArray(waterData) ? waterData : []);
      } catch (error) {
        console.error("Błąd pobierania danych:", error);
      }
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [authFetch, isLoggedIn]);

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
    const result = await register(email, password);
    if (result?.ok) {
      alert("Zarejestrowano pomyślnie");
      setIsRegisterVisible(false);
    }

    return result;
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

  const addProduct = async () => {
    const name = newFood.name.trim();
    const weight = Number(newFood.weight);
    const calories = Number(newFood.calories);

    if (!name || weight <= 0 || calories <= 0) return;

    try {
      const response = await authFetch("/food", {
        method: "POST",
        body: JSON.stringify({ name, weight, calories }),
      });

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Nie udało się dodać posiłku",
        );
        throw new Error(message);
      }

      await loadFoodItems();
      setNewFood({
        name: "",
        weight: "",
        calories: "",
      });
      setActivePanel(null);
    } catch (error) {
      console.error("Błąd dodawania posiłku:", error);
      alert(error?.message || "Nie udało się dodać posiłku.");
    }
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

  const addWater = async () => {
    const name = newWater.name.trim();
    const amount = Number(newWater.amount);
    if (!name || amount <= 0) return;

    try {
      const response = await authFetch("/water", {
        method: "POST",
        body: JSON.stringify({ name, amount }),
      });

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Nie udało się dodać napoju",
        );
        throw new Error(message);
      }

      await loadWaterItems();
      setNewWater({ name: "", amount: "" });
      setActivePanel(null);
    } catch (error) {
      console.error("Błąd dodawania napoju:", error);
      alert(error?.message || "Nie udało się dodać napoju.");
    }
  };

  /* BAR CODE FUNCKJA =======*/

  const fetchProductByBarcode = async (barcode) => {
    console.log("DO FETCH IDZIE:", barcode);

    if (!barcode || barcode.length < 8) {
      console.log("Nieprawidłowy barcode - przerywam");
      return;
    }

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      );

      if (!response.ok) {
        throw new Error("Błąd odpowiedzi serwera");
      }

      const data = await response.json();
      console.log("ODPOWIEDŹ API:", data);

      if (data.status === 1) {
        const product = data.product;

        setDetectedProduct({
          name: product.product_name || "Nieznany produkt",
          calories: product.nutriments?.["energy-kcal_100g"] || 0,
        });
      } else {
        setManualEntry(true);
      }
    } catch (error) {
      console.error("Błąd FETCH:", error);
    }
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
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M3 21c0-4 3-7 6-7s6 3 6 7"></path>
                      <line x1="18" y1="8" x2="18" y2="14"></line>
                      <line x1="15" y1="11" x2="21" y2="11"></line>
                    </svg>
                    Zacznij teraz
                  </button>

                  <button
                    className="register-btn"
                    onClick={() => {
                      setIsLoginVisible(true);
                      setIsRegisterVisible(false);
                    }}
                  >
                    <span>Zaloguj się</span>
                  </button>
                </div>
              )}
            </div>

            <div className="hero-right"></div>
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
                  {foodItems.map((item, index) => {
                    const timeLabel = getTimeFrameLabel(item.createdAt);
                    const addedAt = formatAddedTime(item.createdAt);

                    return (
                      <div key={index} className="food-item">
                        <strong>{item.name}</strong>
                        <span>{item.weight} g</span>
                        <span>{item.calories} kcal</span>
                        <span className="time-frame-badge">{timeLabel}</span>
                        <span className="time-added">Dodano: {addedAt}</span>
                      </div>
                    );
                  })}
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
                  {waterItems.map((item, index) => {
                    const timeLabel = getTimeFrameLabel(item.createdAt);
                    const addedAt = formatAddedTime(item.createdAt);

                    return (
                      <div key={index} className="water-item">
                        <strong>{item.name}</strong>
                        <span>{item.amount} ml</span>
                        <span className="time-frame-badge">{timeLabel}</span>
                        <span className="time-added">Dodano: {addedAt}</span>
                      </div>
                    );
                  })}
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

          {isScannerOpen && (
            <BarcodeScanner
              onDetected={(code) => {
                fetchProductByBarcode(code);
                setIsScannerOpen(false);
              }}
              onClose={() => setIsScannerOpen(false)}
            />
          )}

          {detectedProduct && (
            <div className="type-modal">
              <div className="type-modal-content">
                <h3>Co to jest?</h3>
                <p>
                  <strong>{detectedProduct.name}</strong>
                </p>

                <button
                  onClick={() => {
                    setNewFood({
                      name: detectedProduct.name,
                      weight: 100,
                      calories: detectedProduct.calories,
                    });
                    setActivePanel("food");
                    setDetectedProduct(null);
                  }}
                >
                  🍽 Posiłek
                </button>

                <button
                  onClick={() => {
                    setNewWater({
                      name: detectedProduct.name,
                      amount: 250,
                    });
                    setActivePanel("water");
                    setDetectedProduct(null);
                  }}
                >
                  🥤 Napój
                </button>

                <button onClick={() => setDetectedProduct(null)}>Anuluj</button>
              </div>
            </div>
          )}

          {manualEntry && (
            <div className="type-modal">
              <div className="type-modal-content">
                <h3>Produkt nie istnieje w bazie</h3>
                <p>Czy chcesz dodać go ręcznie?</p>

                <button
                  onClick={() => {
                    setDetectedProduct({
                      name: "",
                      calories: 0,
                    });
                    setManualEntry(false);
                  }}
                >
                  Tak
                </button>

                <button onClick={() => setManualEntry(false)}>Anuluj</button>
              </div>
            </div>
          )}

          <div className="floating-menu">
            {isMenuOpen && (
              <button
                className="scanner"
                onClick={() => {
                  setIsScannerOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                Skanuj kod
              </button>
            )}
            {/* ===== FLOATING + BUTTON ===== */}
            <button
              className={`floating-add-btn ${isMenuOpen ? "is-open" : ""}`}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              +
            </button>
          </div>
        </>
      )}
    </div>
  );
}
