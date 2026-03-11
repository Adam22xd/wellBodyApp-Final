import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthContext } from "./context/AuthContext.jsx";
import BarcodeScanner from "./BarcodeScanner";
import DayPicker from "./DayPicker.jsx";
import { auth } from "./hooks/firebase";
import { onAuthStateChanged } from "firebase/auth";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

import FoodPanel from "./FoodPanel";
import WaterPanel from "./WaterPanel";
import useProgress from "./hooks/useProgress.ts";
import WeeklyOverview from "./WeeklyOverview.jsx";

const normalizeApiUrl = (value) => value.replace(/\/+$/, "");

const ensureApiPath = (value) => {
  const normalized = normalizeApiUrl(value);
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

const resolveApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredUrl) {
    return ensureApiPath(configuredUrl);
  }

  if (import.meta.env.DEV) {
    return "http://localhost:4001/api";
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  return "/api";
};

const API_URL = resolveApiUrl();
const getTodayDateValue = () => new Date().toISOString().slice(0, 10);

const getDateKey = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatSelectedDate = (dateValue) => {
  if (!dateValue) return "Dzisiaj";

  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Dzisiaj";

  return date.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function App() {
  const { getProgress } = useProgress();
  const sanitizeGoalInput = (value) => value.replace(/\D/g, "");
  const emptyFoodForm = {
    name: "",
    weight: "",
    calories: "",
  };
  const emptyWaterForm = {
    name: "",
    amount: "",
  };

  useEffect(() => {
    console.log("Using API_URL:", API_URL);
  }, []);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);

  const [activePanel, setActivePanel] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [calorieGoal, setCalorieGoal] = useState(0);
  const [waterGoal, setWaterGoal] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getTodayDateValue);
  const dateInputRef = useRef(null);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editingWaterId, setEditingWaterId] = useState(null);

  /*=========FOOD MODEL i TYP ============== */
  const [foodItems, setFoodItems] = useState([]);
  const [newFood, setNewFood] = useState(emptyFoodForm);

  /* ========== WATER MODEL =========== */
  const [waterItems, setWaterItems] = useState([]);
  const [newWater, setNewWater] = useState(emptyWaterForm);

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
    currentUser,
    authReady,
  } = useAuthContext();

  const getFirebaseToken = useCallback(async () => {
    if (auth.currentUser) {
      return auth.currentUser.getIdToken();
    }

    const user = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Brak aktywnej sesji użytkownika"));
      }, 5000);

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        unsubscribe();
        clearTimeout(timeoutId);
        if (firebaseUser) {
          resolve(firebaseUser);
          return;
        }
        reject(new Error("Brak aktywnej sesji użytkownika"));
      });
    });

    return user.getIdToken();
  }, []);

  const authFetch = useCallback(async (path, options = {}) => {
    let token;

    try {
      token = await getFirebaseToken();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nie udało się pobrać tokenu użytkownika";
      throw new Error(message);
    }

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
    } catch (error) {
      console.error("authFetch network error:", error);
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

  const loadDashboardData = useCallback(async () => {
    if (!currentUser) {
      setFoodItems([]);
      setWaterItems([]);
      return;
    }

    const [meRes, foodRes, waterRes] = await Promise.all([
      authFetch("/auth/me"),
      authFetch("/food"),
      authFetch("/water"),
    ]);

    if (!meRes.ok || !foodRes.ok || !waterRes.ok) {
      throw new Error("Nie udało się pobrać danych");
    }

    const [meData, foodData, waterData] = await Promise.all([
      meRes.json(),
      foodRes.json(),
      waterRes.json(),
    ]);

    setCalorieGoal(Number(meData?.user?.calorieGoal || 0));
    setWaterGoal(Number(meData?.user?.waterGoal || 0));
    setFoodItems(Array.isArray(foodData) ? foodData : []);
    setWaterItems(Array.isArray(waterData) ? waterData : []);
  }, [authFetch, currentUser]);

  const getErrorMessage = async (response, fallbackMessage) => {
    try {
      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();
      if (!text) return `${fallbackMessage} (HTTP ${response.status})`;
      if (contentType.includes("text/html")) {
        return `${fallbackMessage} (HTTP ${response.status})`;
      }
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

  async function saveGoals(nextCalorieGoal, nextWaterGoal) {
    const response = await authFetch("/auth/goals", {
      method: "PUT",
      body: JSON.stringify({
        calorieGoal: nextCalorieGoal,
        waterGoal: nextWaterGoal,
      }),
    });

    if (!response.ok) {
      const message = await getErrorMessage(
        response,
        "Nie udalo sie zapisac celow",
      );
      throw new Error(message);
    }
  }

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

  const visibleFoodItems = foodItems.filter(
    (item) => getDateKey(item.createdAt) === selectedDate,
  );
  const visibleWaterItems = waterItems.filter(
    (item) => getDateKey(item.createdAt) === selectedDate,
  );
  const selectedDateLabel = formatSelectedDate(selectedDate);
  const totalCalories = visibleFoodItems.reduce(
    (sum, item) => sum + Number(item.calories || 0),
    0,
  );
  const totalWater = visibleWaterItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  const caloriesProgress = getProgress(totalCalories, calorieGoal);
  const waterProgress = getProgress(totalWater, waterGoal);

  useEffect(() => {
    let cancelled = false;

    if (!authReady) {
      return undefined;
    }

    if (!isLoggedIn || !currentUser) {
      setFoodItems([]);
      setWaterItems([]);
      return undefined;
    }

    const syncDashboard = async () => {
      try {
        await loadDashboardData();
      } catch (error) {
        if (!cancelled) {
          console.error("Błąd pobierania danych:", error);
        }
      }
    };

    syncDashboard();

    return () => {
      cancelled = true;
    };
  }, [authReady, currentUser, isLoggedIn, loadDashboardData]);

  /* ========= LOGIN ========= */

  const handleLogin = async () => {
    const success = await loginUser();
    if (success) {
      try {
        await loadDashboardData();
      } catch (error) {
        console.error("Błąd odświeżania danych po logowaniu:", error);
      }
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
    setEditingFoodId(null);
    setEditingWaterId(null);
    setNewFood(emptyFoodForm);
    setNewWater(emptyWaterForm);
  };

  const openSection = (sectionName) => {
    closePanel();
    setActiveSection((prev) => (prev === sectionName ? null : sectionName));
  };

  /* ======== TOGGLE FOOD BUTTON ============ */

  const toggleFoodPanel = () => {
    setEditingFoodId(null);
    setEditingWaterId(null);
    setNewFood(emptyFoodForm);
    setActivePanel((prev) => (prev === "food" ? null : "food"));
  };

  /* ========= FOOD ========= */

  const addProduct = async () => {
    const name = newFood.name.trim();
    const weight = Number(newFood.weight);
    const calories = Number(newFood.calories);

    if (!name || weight <= 0 || calories <= 0) return;

    try {
      const response = await authFetch(
        editingFoodId ? `/food/${editingFoodId}` : "/food",
        {
          method: editingFoodId ? "PUT" : "POST",
          body: JSON.stringify({ name, weight, calories }),
        },
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          editingFoodId
            ? "Nie udalo sie zapisac zmian posilku"
            : "Nie udało się dodać posiłku",
        );
        throw new Error(message);
      }

      await loadFoodItems();
      closePanel();
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
    setEditingWaterId(null);
    setEditingFoodId(null);
    setNewWater(emptyWaterForm);
    setActivePanel((prev) => (prev === "water" ? null : "water"));
  };

  const updateWater = (field, value) => {
    setNewWater((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFoodGoalBlur = async () => {
    try {
      await saveGoals(calorieGoal, waterGoal);
    } catch (error) {
      console.error("Blad zapisu celu kalorii:", error);
      alert(error?.message || "Nie udalo sie zapisac celu kalorii.");
    }
  };

  const handleWaterGoalBlur = async () => {
    try {
      await saveGoals(calorieGoal, waterGoal);
    } catch (error) {
      console.error("Blad zapisu celu wody:", error);
      alert(error?.message || "Nie udalo sie zapisac celu wody.");
    }
  };

  const startFoodEdit = (item) => {
    setEditingFoodId(item.id);
    setNewFood({
      name: item.name,
      weight: item.weight,
      calories: item.calories,
    });
    setActivePanel("food");
  };

  const startWaterEdit = (item) => {
    setEditingWaterId(item.id);
    setNewWater({
      name: item.name,
      amount: item.amount,
    });
    setActivePanel("water");
  };

  const deleteFood = async (id) => {
    try {
      const response = await authFetch(`/food/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Nie udalo sie usunac posilku",
        );
        throw new Error(message);
      }

      await loadFoodItems();
    } catch (error) {
      console.error("Blad usuwania posilku:", error);
      alert(error?.message || "Nie udalo sie usunac posilku.");
    }
  };

  const deleteWater = async (id) => {
    try {
      const response = await authFetch(`/water/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Nie udalo sie usunac napoju",
        );
        throw new Error(message);
      }

      await loadWaterItems();
    } catch (error) {
      console.error("Blad usuwania napoju:", error);
      alert(error?.message || "Nie udalo sie usunac napoju.");
    }
  };

  const addWater = async () => {
    const name = newWater.name.trim();
    const amount = Number(newWater.amount);
    if (!name || amount <= 0) return;

    try {
      const response = await authFetch(
        editingWaterId ? `/water/${editingWaterId}` : "/water",
        {
          method: editingWaterId ? "PUT" : "POST",
          body: JSON.stringify({ name, amount }),
        },
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          editingWaterId
            ? "Nie udalo sie zapisac zmian napoju"
            : "Nie udało się dodać napoju",
        );
        throw new Error(message);
      }

      await loadWaterItems();
      closePanel();
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
                <DayPicker
                  selectedDate={selectedDate}
                  dateInputRef={dateInputRef}
                  onChange={setSelectedDate}
                />
                <button
                  type="button"
                  className={`nav-icon-btn ${activeSection === "food" ? "is-active" : ""}`}
                  onClick={() => openSection("food")}
                  title="Posilki"
                >
                  <i className="fa-solid fa-utensils" />
                </button>
                <button
                  type="button"
                  className={`nav-icon-btn ${activeSection === "water" ? "is-active" : ""}`}
                  onClick={() => openSection("water")}
                  title="Napoje"
                >
                  <i className="fa-solid fa-glass-water" />
                </button>
                <button
                  type="button"
                  className={`nav-icon-btn ${isScannerOpen ? "is-active" : ""}`}
                  onClick={() => setIsScannerOpen(true)}
                  title="Skaner"
                >
                  <i className="fa-solid fa-barcode" />
                </button>
                <span className="user-badge">PL</span>

                <button
                  className="logout-btn"
                  onClick={async () => {
                    console.log("klik");
                    await logout();
                    setActiveSection(null);
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
            <h1 className="dashboard-title">{selectedDateLabel}</h1>
          </header>
          {!activeSection && (
          <>
          <section className="dashboard-summary">
            <div className="summary-card">
              <div className="summary-head">
                <div>
                  <p className="summary-kicker">Suma z posiłków</p>
                  <h2>Kalorie</h2>
                </div>
                <input
                  className="summary-goal-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={calorieGoal}
                  onChange={(e) =>
                    setCalorieGoal(Number(sanitizeGoalInput(e.target.value) || 0))
                  }
                  onBlur={handleFoodGoalBlur}
                />
              </div>
              <p className="summary-value">
                {totalCalories} / {calorieGoal} kcal
              </p>
              <div className="progressbar summary-progress">
                <div style={{ width: `${caloriesProgress}%` }} />
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-head">
                <div>
                  <p className="summary-kicker">Suma z napojów</p>
                  <h2>Woda</h2>
                </div>
                <input
                  className="summary-goal-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={waterGoal}
                  onChange={(e) =>
                    setWaterGoal(Number(sanitizeGoalInput(e.target.value) || 0))
                  }
                  onBlur={handleWaterGoalBlur}
                />
              </div>
              <p className="summary-value">
                {totalWater} / {waterGoal} ml
              </p>
              <div className="progressbar summary-progress water">
                <div style={{ width: `${waterProgress}%` }} />
              </div>
            </div>
          </section>
          <WeeklyOverview
            selectedDate={selectedDate}
            foodItems={foodItems}
            waterItems={waterItems}
          />
          </>
          )}
          {activeSection && (
            <div className="dashboard-cards">
            {/* ======================================================================================================= POSIŁKI ===== */}
            {activeSection === "food" && (
            <div className="dashboard-card dashboard-card-single">
              <h2>Posiłki</h2>
              <div className="card-icon">
                <i className="fa-solid fa-utensils"></i>
              </div>

              <p>
                {visibleFoodItems.length
                  ? `${visibleFoodItems.length} posiłków`
                  : "Brak posiłków"}
              </p>

              {visibleFoodItems.length > 0 && (
                <div className="food-list">
                  {visibleFoodItems.map((item) => {
                    const timeLabel = getTimeFrameLabel(item.createdAt);
                    const addedAt = formatAddedTime(item.createdAt);

                    return (
                      <div key={item.id} className="food-item">
                        <div className="entry-main">
                          <strong>{item.name}</strong>
                          <span>{item.weight} g</span>
                          <span>{item.calories} kcal</span>
                          <span className="time-frame-badge">{timeLabel}</span>
                          <span className="time-added">Dodano: {addedAt}</span>
                        </div>
                        <div className="entry-actions">
                          <button
                            type="button"
                            className="entry-action edit"
                            onClick={() => startFoodEdit(item)}
                          >
                            Edytuj
                          </button>
                          <button
                            type="button"
                            className="entry-action delete"
                            onClick={() => deleteFood(item.id)}
                          >
                            Usun
                          </button>
                        </div>
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
                  title={editingFoodId ? "Edytuj posilek" : "Posilki"}
                  submitLabel={editingFoodId ? "Zapisz zmiany" : "Dodaj produkt"}
                />
              )}
              <button className="toggle-btn" onClick={toggleFoodPanel}>
                {" "}
                + Add
              </button>
            </div>
            )}

            {/* ============================================================================================================== NAPOJE ===== */}
            {activeSection === "water" && (
            <div className="dashboard-card dashboard-card-single">
              <h2>Napoje</h2>
              <div className="card-icon">
                <i className="fa-solid fa-glass-water"></i>
              </div>

              <p>
                {visibleWaterItems.length
                  ? `${visibleWaterItems.length} napojów`
                  : "Brak napojów"}
              </p>

              {visibleWaterItems.length > 0 && (
                <div className="water-list">
                  {visibleWaterItems.map((item) => {
                    const timeLabel = getTimeFrameLabel(item.createdAt);
                    const addedAt = formatAddedTime(item.createdAt);

                    return (
                      <div key={item.id} className="water-item">
                        <div className="entry-main">
                          <strong>{item.name}</strong>
                          <span>{item.amount} ml</span>
                          <span className="time-frame-badge">{timeLabel}</span>
                          <span className="time-added">Dodano: {addedAt}</span>
                        </div>
                        <div className="entry-actions">
                          <button
                            type="button"
                            className="entry-action edit"
                            onClick={() => startWaterEdit(item)}
                          >
                            Edytuj
                          </button>
                          <button
                            type="button"
                            className="entry-action delete"
                            onClick={() => deleteWater(item.id)}
                          >
                            Usun
                          </button>
                        </div>
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
                  title={editingWaterId ? "Edytuj napoj" : "Napoje"}
                  submitLabel={editingWaterId ? "Zapisz zmiany" : "Dodaj napoj"}
                />
              )}

              <button className="toggle-btn" onClick={toggleWaterPanel}>
                + Add
              </button>
            </div>
            )}
          </div>
          )}

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
        </>
      )}
    </div>
  );
}
