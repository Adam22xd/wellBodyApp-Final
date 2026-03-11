import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import BarcodeScanner from "./BarcodeScanner";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import useProgress from "./hooks/useProgress.ts";
import { auth } from "./hooks/firebase";
import { useAuthContext } from "./context/AuthContext.jsx";
import { getDateKey, formatSelectedDate, getTodayDateValue } from "./utils/date.js";
import { getApiCandidates, getErrorMessage } from "./utils/api.js";
import { sanitizeGoalInput } from "./utils/dashboard.js";
import AppNavbar from "./components/layout/AppNavbar.jsx";
import DashboardSummary from "./components/dashboard/DashboardSummary.jsx";
import TrackerSection from "./components/dashboard/TrackerSection.jsx";

const API_CANDIDATES = getApiCandidates();

const EMPTY_FOOD_FORM = {
  name: "",
  weight: "",
  calories: "",
};

const EMPTY_WATER_FORM = {
  name: "",
  amount: "",
};

export default function App() {
  const { getProgress } = useProgress();
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [calorieGoal, setCalorieGoal] = useState(0);
  const [waterGoal, setWaterGoal] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getTodayDateValue);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editingWaterId, setEditingWaterId] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [newFood, setNewFood] = useState(EMPTY_FOOD_FORM);
  const [waterItems, setWaterItems] = useState([]);
  const [newWater, setNewWater] = useState(EMPTY_WATER_FORM);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const dateInputRef = useRef(null);

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

    const headers = {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    };

    let lastError;

    for (const apiBase of API_CANDIDATES) {
      try {
        return await fetch(`${apiBase}${path}`, {
          ...options,
          headers,
        });
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(
      `Brak połączenia z API. Sprawdzone adresy: ${API_CANDIDATES.join(", ")}.`,
      { cause: lastError },
    );
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

  const saveGoals = useCallback(async (nextCalorieGoal, nextWaterGoal) => {
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
  }, [authFetch]);

  const closePanel = useCallback(() => {
    setActivePanel(null);
    setEditingFoodId(null);
    setEditingWaterId(null);
    setNewFood(EMPTY_FOOD_FORM);
    setNewWater(EMPTY_WATER_FORM);
  }, []);

  const openSection = useCallback((sectionName) => {
    closePanel();
    setActiveSection((prev) => (prev === sectionName ? null : sectionName));
  }, [closePanel]);

  const toggleFoodPanel = useCallback(() => {
    setEditingFoodId(null);
    setEditingWaterId(null);
    setNewFood(EMPTY_FOOD_FORM);
    setActivePanel((prev) => (prev === "food" ? null : "food"));
  }, []);

  const toggleWaterPanel = useCallback(() => {
    setEditingWaterId(null);
    setEditingFoodId(null);
    setNewWater(EMPTY_WATER_FORM);
    setActivePanel((prev) => (prev === "water" ? null : "water"));
  }, []);

  const updateFood = useCallback((field, value) => {
    setNewFood((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const updateWater = useCallback((field, value) => {
    setNewWater((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const addProduct = useCallback(async () => {
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
  }, [authFetch, closePanel, editingFoodId, loadFoodItems, newFood]);

  const addWater = useCallback(async () => {
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
  }, [authFetch, closePanel, editingWaterId, loadWaterItems, newWater]);

  const deleteFood = useCallback(async (id) => {
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
  }, [authFetch, loadFoodItems]);

  const deleteWater = useCallback(async (id) => {
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
  }, [authFetch, loadWaterItems]);

  const handleFoodGoalBlur = useCallback(async () => {
    try {
      await saveGoals(calorieGoal, waterGoal);
    } catch (error) {
      console.error("Blad zapisu celu kalorii:", error);
      alert(error?.message || "Nie udalo sie zapisac celu kalorii.");
    }
  }, [calorieGoal, saveGoals, waterGoal]);

  const handleWaterGoalBlur = useCallback(async () => {
    try {
      await saveGoals(calorieGoal, waterGoal);
    } catch (error) {
      console.error("Blad zapisu celu wody:", error);
      alert(error?.message || "Nie udalo sie zapisac celu wody.");
    }
  }, [calorieGoal, saveGoals, waterGoal]);

  const startFoodEdit = useCallback((item) => {
    setEditingFoodId(item.id);
    setNewFood({
      name: item.name,
      weight: item.weight,
      calories: item.calories,
    });
    setActivePanel("food");
  }, []);

  const startWaterEdit = useCallback((item) => {
    setEditingWaterId(item.id);
    setNewWater({
      name: item.name,
      amount: item.amount,
    });
    setActivePanel("water");
  }, []);

  const fetchProductByBarcode = useCallback(async (barcode) => {
    if (!barcode || barcode.length < 8) {
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
  }, []);

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

  const handleRegister = async (nextEmail, password) => {
    const result = await register(nextEmail, password);

    if (result?.ok) {
      alert("Zarejestrowano pomyślnie");
      setIsRegisterVisible(false);
    }

    return result;
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

  return (
    <div className="main-icon">
      <div className="app-wrapper">
        <AppNavbar
          isLoggedIn={isLoggedIn}
          selectedDate={selectedDate}
          dateInputRef={dateInputRef}
          onDateChange={setSelectedDate}
          activeSection={activeSection}
          isScannerOpen={isScannerOpen}
          onOpenSection={openSection}
          onOpenScanner={() => setIsScannerOpen(true)}
          onLogout={async () => {
            await logout();
            setActiveSection(null);
          }}
          onShowLogin={() => {
            setIsLoginVisible(true);
            setIsRegisterVisible(false);
          }}
          onShowRegister={() => {
            setIsRegisterVisible(true);
            setIsLoginVisible(false);
          }}
        />

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
                      <circle cx="9" cy="7" r="4" />
                      <path d="M3 21c0-4 3-7 6-7s6 3 6 7" />
                      <line x1="18" y1="8" x2="18" y2="14" />
                      <line x1="15" y1="11" x2="21" y2="11" />
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

            <div className="hero-right" />
          </header>
        )}

        {(isLoginVisible || isRegisterVisible) && (
          <div className="modal-wrapper">
            <div
              className="overlay"
              onClick={() => {
                setIsLoginVisible(false);
                setIsRegisterVisible(false);
              }}
            />

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
          <header className="dashboard-header">
            <h1 className="dashboard-title">{selectedDateLabel}</h1>
          </header>

          {!activeSection && (
            <DashboardSummary
              selectedDate={selectedDate}
              totalCalories={totalCalories}
              calorieGoal={calorieGoal}
              totalWater={totalWater}
              waterGoal={waterGoal}
              caloriesProgress={caloriesProgress}
              waterProgress={waterProgress}
              onCalorieGoalChange={(e) =>
                setCalorieGoal(Number(sanitizeGoalInput(e.target.value) || 0))
              }
              onWaterGoalChange={(e) =>
                setWaterGoal(Number(sanitizeGoalInput(e.target.value) || 0))
              }
              onCalorieGoalBlur={handleFoodGoalBlur}
              onWaterGoalBlur={handleWaterGoalBlur}
              foodItems={foodItems}
              waterItems={waterItems}
            />
          )}

          {activeSection && (
            <div className="dashboard-cards">
              {activeSection === "food" && (
                <TrackerSection
                  type="food"
                  items={visibleFoodItems}
                  activePanel={activePanel}
                  editingId={editingFoodId}
                  foodForm={newFood}
                  waterForm={newWater}
                  onStartEdit={startFoodEdit}
                  onDelete={deleteFood}
                  onTogglePanel={toggleFoodPanel}
                  onClosePanel={closePanel}
                  onUpdateFood={updateFood}
                  onUpdateWater={updateWater}
                  onAddFood={addProduct}
                  onAddWater={addWater}
                />
              )}

              {activeSection === "water" && (
                <TrackerSection
                  type="water"
                  items={visibleWaterItems}
                  activePanel={activePanel}
                  editingId={editingWaterId}
                  foodForm={newFood}
                  waterForm={newWater}
                  onStartEdit={startWaterEdit}
                  onDelete={deleteWater}
                  onTogglePanel={toggleWaterPanel}
                  onClosePanel={closePanel}
                  onUpdateFood={updateFood}
                  onUpdateWater={updateWater}
                  onAddFood={addProduct}
                  onAddWater={addWater}
                />
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
