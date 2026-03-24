import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import BarcodeScanner from "./BarcodeScanner";
import CompleteProfileForm from "./CompleteProfileForm";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import useProgress from "./hooks/useProgress.ts";
import { auth } from "./hooks/firebase";
import { useAuthContext } from "./context/AuthContext.jsx";
import {
  getDateKey,
  formatSelectedDate,
  getTodayDateValue,
} from "./utils/date.js";
import { getApiCandidates, getErrorMessage } from "./utils/api.js";
import { sanitizeGoalInput } from "./utils/dashboard.js";
import AppNavbar from "./components/layout/AppNavbar.jsx";
import TrackerSection from "./components/dashboard/TrackerSection.jsx";

const API_CANDIDATES = getApiCandidates();
const LAST_WORKING_API_KEY = "wellbody:last-working-api";

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
  const [localBarcodeCache, setLocalBarcodeCache] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("barcode-cache") || "{}");
    } catch {
      return {};
    }
  });
  // ⏳ Loading state dla spinnera podczas szukania produktu
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const dateInputRef = useRef(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const apiBaseRef = useRef(
    typeof window !== "undefined"
      ? window.localStorage.getItem(LAST_WORKING_API_KEY)
      : null,
  );

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

  const authFetch = useCallback(
    async (path, options = {}) => {
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

      const prioritizedCandidates = [
        ...(import.meta.env.DEV ? ["http://localhost:4001/api"] : []),
        ...(apiBaseRef.current && apiBaseRef.current.includes("4001")
          ? [apiBaseRef.current]
          : []),
        ...API_CANDIDATES,
      ].filter(Boolean);
      const uniqueCandidates = [...new Set(prioritizedCandidates)];
      let lastError;

      for (const apiBase of uniqueCandidates) {
        try {
          const response = await fetch(`${apiBase}${path}`, {
            ...options,
            headers,
          });

          apiBaseRef.current = apiBase;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(LAST_WORKING_API_KEY, apiBase);
          }

          console.log("[authFetch] API base:", apiBase, "path:", path);

          return response;
        } catch (error) {
          lastError = error;
        }
      }

      throw new Error(
        `Brak połączenia z API. Sprawdzone adresy: ${API_CANDIDATES.join(", ")}.`,
        { cause: lastError },
      );
    },
    [getFirebaseToken],
  );

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
      setNeedsOnboarding(false);
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

    setNeedsOnboarding(
      Number(meData?.user?.calorieGoal || 0) === 0 &&
        Number(meData?.user?.waterGoal || 0) === 0,
    );
    setFoodItems(Array.isArray(foodData) ? foodData : []);
    setWaterItems(Array.isArray(waterData) ? waterData : []);
  }, [authFetch, currentUser]);

  const saveGoals = useCallback(
    async (nextCalorieGoal, nextWaterGoal) => {
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
    },
    [authFetch],
  );

  const closePanel = useCallback(() => {
    setActivePanel(null);
    setEditingFoodId(null);
    setEditingWaterId(null);
    setNewFood(EMPTY_FOOD_FORM);
    setNewWater(EMPTY_WATER_FORM);
  }, []);

  const openSection = useCallback(
    (sectionName) => {
      closePanel();
      setActiveSection((prev) => (prev === sectionName ? null : sectionName));
    },
    [closePanel],
  );

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

  const addScannedFood = useCallback(
    async ({ name, weight, calories, barcode }) => {
      const safeName = String(name || "").trim();
      const safeWeight = Number(weight || 100);
      const safeCalories = Number(calories || 0);

      if (!safeName || safeWeight <= 0 || safeCalories <= 0) {
        alert("Nieprawidłowe dane produktu do posiłku.");
        return;
      }

      try {
        const response = await authFetch("/food", {
          method: "POST",
          body: JSON.stringify({
            name: safeName,
            weight: safeWeight,
            calories: safeCalories,
          }),
        });

        if (!response.ok) {
          const message = await getErrorMessage(
            response,
            "Nie udało się dodać zeskanowanego produktu jako posiłek",
          );
          throw new Error(message);
        }

        if (isLoggedIn && currentUser && barcode) {
          authFetch(`/food/cache`, {
            method: "POST",
            body: JSON.stringify({
              barcode,
              name: safeName,
              calories: safeCalories,
            }),
          }).catch((err) => console.error("Cache save error:", err));
        }

        await loadFoodItems();
        setDetectedProduct(null);
        setActivePanel(null);
      } catch (error) {
        console.error("Błąd dodawania zeskanowanego posiłku:", error);
        alert(
          error?.message ||
            "Nie udało się dodać zeskanowanego produktu jako posiłek.",
        );
      }
    },
    [authFetch, currentUser, isLoggedIn, loadFoodItems],
  );

  const addScannedWater = useCallback(
    async ({ name, amount, barcode }) => {
      const safeName = String(name || "").trim();
      const safeAmount = Math.floor(Number(amount || 250));

      if (!safeName || safeAmount <= 0) {
        alert("Nieprawidłowe dane produktu do napoju.");
        return;
      }

      try {
        console.debug("addScannedWater: payload", {
          name: safeName,
          amount: safeAmount,
          barcode,
        });

        const response = await authFetch("/water", {
          method: "POST",
          body: JSON.stringify({ name: safeName, amount: safeAmount }),
        });

        if (!response.ok) {
          const message = await getErrorMessage(
            response,
            "Nie udało się dodać zeskanowanego produktu jako napój",
          );
          console.error("addScannedWater non-OK response", {
            status: response.status,
            statusText: response.statusText,
            message,
          });
          throw new Error(message);
        }

        if (isLoggedIn && currentUser && barcode) {
          authFetch(`/food/cache`, {
            method: "POST",
            body: JSON.stringify({ barcode, name: safeName, calories: 0 }),
          }).catch((err) => console.error("Cache save error:", err));
        }

        await loadWaterItems();
        setDetectedProduct(null);
        setActivePanel(null);
      } catch (error) {
        console.error("Błąd dodawania zeskanowanego napoju:", error);
        alert(
          error?.message ||
            "Nie udało się dodać zeskanowanego produktu jako napój.",
        );
      }
    },
    [authFetch, currentUser, isLoggedIn, loadWaterItems],
  );

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

  const deleteFood = useCallback(
    async (id) => {
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
    },
    [authFetch, loadFoodItems],
  );

  const deleteWater = useCallback(
    async (id) => {
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
    },
    [authFetch, loadWaterItems],
  );

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

  const BARCODE_FALLBACKS = {
    5449000000996: { name: "Coca-Cola", calories: 42 },
    5000159484695: { name: "Red Bull Energy Drink", calories: 45 },
    5411188119576: { name: "Monster Energy", calories: 45 },
  };

  const fetchProductByBarcode = useCallback(
    async (barcode) => {
      // sprawdzenie długości barcodu
      if (!barcode) {
        return;
      }

      barcode = String(barcode).trim();
      if (barcode.length < 6) {
        return;
      }

      const fallback = BARCODE_FALLBACKS[barcode];
      if (fallback) {
        console.log("🍶 fallback product:", barcode, fallback);
        setDetectedProduct({
          name: fallback.name,
          calories: fallback.calories,
          barcode,
          fromCache: false,
        });
        return;
      }

      const normalizeBarcodes = (code) => {
        const candidates = new Set([code]);
        const clean = code.replace(/^0+/, "");

        if (clean) candidates.add(clean);
        if (code.length === 8) candidates.add(`0${code}`); // EAN-8 -> EAN-13
        if (code.length === 7) {
          candidates.add(`0${code}`);
          candidates.add(`00${code}`);
        }
        if (code.length < 8 && code.length >= 6) {
          candidates.add(code.padStart(8, "0"));
        }

        return Array.from(candidates).filter(
          (c) => c.length >= 6 && c.length <= 14,
        );
      };

      const barcodeCandidates = normalizeBarcodes(barcode);

      const findFromCache = async () => {
        for (const candidate of barcodeCandidates) {
          const local = localBarcodeCache[candidate];
          if (local) {
            return {
              name: local.name,
              calories: local.calories,
              barcode: candidate,
            };
          }

          try {
            const remoteResponse = await authFetch(`/food/cache/${candidate}`);
            if (remoteResponse.ok) {
              const cachedRemote = await remoteResponse.json();
              return {
                name: cachedRemote.name,
                calories: cachedRemote.calories,
                barcode: cachedRemote.barcode,
              };
            }
          } catch {
            // fallback, spróbujemy następny kandydat
          }
        }

        return null;
      };

      const preCached = await findFromCache();
      if (preCached) {
        setDetectedProduct({
          name: preCached.name,
          calories: preCached.calories,
          barcode: preCached.barcode,
          fromCache: true,
        });
        setIsSearchingProduct(false);
        return;
      }

      // 🔎 Najpierw sprawdź lokalny cache po stronie aplikacji
      const localCached = localBarcodeCache[barcode];
      if (localCached) {
        console.log("✅ Produkt z lokalnego cache:", barcode, localCached);
        setDetectedProduct({
          name: localCached.name,
          calories: localCached.calories,
          barcode,
          fromCache: true,
        });
        return;
      }

      try {
        // Włącz spinner - pokazuje "Szukam produktu..."
        setIsSearchingProduct(true);

        // 🚀 KROK 1: Sprawdź CACHE (tylko jeśli użytkownik jest zalogowany)
        if (isLoggedIn && currentUser) {
          try {
            const cacheResponse = await authFetch(`/food/cache/${barcode}`);

            if (cacheResponse.ok) {
              const cached = await cacheResponse.json();
              console.log("✅ Produkt z cache:", cached);

              setDetectedProduct({
                name: cached.name,
                calories: cached.calories,
                barcode: cached.barcode,
                fromCache: true,
              });

              const localNext = {
                ...localBarcodeCache,
                [barcode]: { name: cached.name, calories: cached.calories },
              };
              setLocalBarcodeCache(localNext);
              window.localStorage.setItem(
                "barcode-cache",
                JSON.stringify(localNext),
              );

              setIsSearchingProduct(false);
              return;
            }
          } catch (cacheError) {
            console.log(
              "Cache niedostępny, sprawdzam API:",
              cacheError.message,
            );
            // Kontynuuj do API jeśli cache nie działa
          }
        }

        // 🌐 KROK 2: Jeśli nie w cache lub nie zalogowany, pytaj API.
        // Pierwszeństwo mają normalizacje 8/13/6-cyfrowe.
        let foundProduct = null;

        for (const candidate of barcodeCandidates) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          try {
            const response = await fetch(
              `https://world.openfoodfacts.org/api/v0/product/${candidate}.json`,
              { signal: controller.signal },
            );
            clearTimeout(timeoutId);

            if (response.status === 404 || response.status === 400) {
              console.log(
                "Produkt nieznany w OpenFoodFacts:",
                candidate,
                response.status,
              );
              continue; // spróbuj następny kandydat
            }

            if (!response.ok) {
              throw new Error(`Błąd odpowiedzi serwera: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === 1 && data.product) {
              foundProduct = { candidate, product: data.product };
              break;
            }
          } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === "AbortError") {
              console.log(
                "⏱️ Timeout: OpenFoodFacts nie odpowiada (>5s) dla",
                candidate,
              );
              continue;
            }
            throw error;
          }
        }

        if (!foundProduct) {
          console.log("Brak produktu w OpenFoodFacts dla wszystkich kandydatów", barcodeCandidates);
          setManualEntry(true);
          setIsSearchingProduct(false);
          return;
        }

        const product = foundProduct.product;
        const productName = product.product_name || "Nieznany produkt";
        const productCalories = product.nutriments?.["energy-kcal_100g"] || 0;

        setDetectedProduct({
          name: productName,
          calories: productCalories,
          barcode: foundProduct.candidate,
          fromCache: false,
        });

        const localNext = {
          ...localBarcodeCache,
          [foundProduct.candidate]: { name: productName, calories: productCalories },
        };
        setLocalBarcodeCache(localNext);
        window.localStorage.setItem("barcode-cache", JSON.stringify(localNext));

        // 💾 Automatycznie cache'uj znaleziony produkt w API
        if (isLoggedIn && currentUser) {
          authFetch(`/food/cache`, {
            method: "POST",
            body: JSON.stringify({
              barcode: foundProduct.candidate,
              name: productName,
              calories: productCalories,
            }),
          }).catch((err) => console.error("Cache save error:", err));
        }
            const product = data.product;
            const productName = product.product_name || "Nieznany produkt";
            const productCalories =
              product.nutriments?.["energy-kcal_100g"] || 0;

            setDetectedProduct({
              name: productName,
              calories: productCalories,
              barcode: barcode,
              fromCache: false,
            });

            const localNext = {
              ...localBarcodeCache,
              [barcode]: { name: productName, calories: productCalories },
            };
            setLocalBarcodeCache(localNext);
            window.localStorage.setItem(
              "barcode-cache",
              JSON.stringify(localNext),
            );

            // 💾 Automatycznie cache'uj znaleziony produkt w API
            if (isLoggedIn && currentUser) {
              authFetch(`/food/cache`, {
                method: "POST",
                body: JSON.stringify({
                  barcode,
                  name: productName,
                  calories: productCalories,
                }),
              }).catch((err) => console.error("Cache save error:", err));
            }
          } else {
            // X Produkt nie znaleziony -> użytkownik wpisuje ręcznie
            setManualEntry(true);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError.name === "AbortError") {
            console.log(
              "⏱️ Timeout: API OpenFoodFacts nie odpowiada (>5s), idę do ręcznego wpisu",
            );
            setManualEntry(true);
          } else {
            throw fetchError;
          }
        }
      } catch (error) {
        console.error("Błąd FETCH:", error);
        // Pokaż błąd użytkownikowi
        alert("Błąd podczas pobierania danych produktu. Spróbuj ponownie.");
      } finally {
        // Wyłącz spinner w każdym przypadku
        setIsSearchingProduct(false);
      }
    },
    [authFetch, isLoggedIn, currentUser, localBarcodeCache],
  );

  useEffect(() => {
    let cancelled = false;

    if (!authReady) {
      return undefined;
    }

    if (!isLoggedIn || !currentUser) {
      setFoodItems([]);
      setWaterItems([]);
      setNeedsOnboarding(false);
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
    const result = await loginUser();

    if (!result.ok) {
      if (result.reason === "email-not-verified") {
        alert(
          "Najpierw potwierdź adres e-mail klikając link w wiadomości od Firebase.",
        );
        return;
      }

      alert("Nie udało się zalogować. Sprawdź email i hasło.");
      return;
    }

    try {
      await loadDashboardData();
    } catch (error) {
      console.error("Błąd odświeżania danych po logowaniu:", error);
    }

    alert("Zalogowano pomyślnie");
    setActiveSection(null);
    setIsLoginVisible(false);
  };

  const handleRegister = async (nextEmail, password) => {
    const result = await register(nextEmail, password);

    if (result?.ok) {
      alert(
        "Konto utworzone pomyślnie. Sprawdź swoją skrzynkę e-mail, aby zweryfikować konto przed logowaniem.",
      );
      setIsRegisterVisible(false);
      setIsLoginVisible(true);
    }

    return result;
  };

  const handleCompleteProfile = async (nextCalorieGoal, nextWaterGoal) => {
    await saveGoals(nextCalorieGoal, nextWaterGoal);
    setCalorieGoal(nextCalorieGoal);
    setWaterGoal(nextWaterGoal);
    setNeedsOnboarding(false);
    alert("Profil został uzupełniony.");
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
              <p className="hero-eyebrow">
                Nutrition journal for real routines
              </p>
              <h1>Kontroluj dietę i nawodnienie</h1>
              <p>
                Prosta aplikacja do monitorowania kalorii i ilosci wypitej wody.
                Bez chaosu, bez przekombinowania, z czytelnym planem na kazdy
                dzien.
              </p>

              <div className="hero-points" aria-label="Najwazniejsze korzysci">
                <span>Codzienne cele kalorii i wody</span>
                <span>Szybkie dodawanie wpisow</span>
                <span>Jeden widok na caly dzien</span>
              </div>

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

            <div className="hero-right">
              <div className="hero-editorial-card">
                <p className="hero-card-kicker">Today in balance</p>
                <h2>
                  Mniej tabel, wiecej decyzji, ktore faktycznie sa proste.
                </h2>
                <p>
                  Zobacz cele, wpisy i postep w jednym miejscu zamiast skakac
                  miedzy notatkami i kalkulatorem.
                </p>

                <div className="hero-card-metrics">
                  <div>
                    <strong>2100</strong>
                    <span>cel kalorii</span>
                  </div>
                  <div>
                    <strong>2400 ml</strong>
                    <span>cel wody</span>
                  </div>
                  <div>
                    <strong>1 dashboard</strong>
                    <span>na caly dzien</span>
                  </div>
                </div>
              </div>
            </div>
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
                  onClose={() => setIsLoginVisible(false)}
                  onSwitchToRegister={() => {
                    setIsLoginVisible(false);
                    setIsRegisterVisible(true);
                  }}
                />
              )}

              {isRegisterVisible && (
                <RegisterForm
                  email={email}
                  setEmail={setEmail}
                  passwordReg={passwordReg}
                  setPasswordReg={setPasswordReg}
                  onClose={() => setIsRegisterVisible(false)}
                  onSwitchToLogin={() => {
                    setIsRegisterVisible(false);
                    setIsLoginVisible(true);
                  }}
                  register={handleRegister}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {isLoggedIn && needsOnboarding && (
        <CompleteProfileForm
          initialCalorieGoal={calorieGoal}
          initialWaterGoal={waterGoal}
          onSubmit={handleCompleteProfile}
        />
      )}

      {isLoggedIn && !needsOnboarding && (
        <>
          {!activeSection && (
            <section className="logged-home">
              <div className="logged-home-copy">
                <p className="hero-eyebrow">
                  Daily brief • {selectedDateLabel}
                </p>
                <h1 className="dashboard-title logged-home-title">
                  Zacznij od ustawienia swoich celow na dzisiaj.
                </h1>
                <p className="logged-home-text">
                  Po lewej masz spokojny start, a reszte otwierasz dopiero z
                  przyciskow w nawigacji. Najpierw kalorie i woda, potem
                  posilki, napoje i skaner.
                </p>
              </div>

              <div className="dashboard-summary goal-prompt-grid">
                <div className="summary-card goal-prompt-card">
                  <div className="summary-head">
                    <div>
                      <p className="summary-kicker">Dzienny plan</p>
                      <h2>Cel kalorii</h2>
                    </div>
                    <span className="goal-prompt-unit">kcal</span>
                  </div>
                  <input
                    className="summary-goal-input goal-prompt-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={calorieGoal}
                    onChange={(e) =>
                      setCalorieGoal(
                        Number(sanitizeGoalInput(e.target.value) || 0),
                      )
                    }
                    onBlur={handleFoodGoalBlur}
                  />
                  <p className="summary-value">
                    Dzisiaj zjedzone: {totalCalories} kcal
                  </p>
                  <div className="progressbar summary-progress">
                    <div style={{ width: `${caloriesProgress}%` }} />
                  </div>
                </div>

                <div className="summary-card goal-prompt-card">
                  <div className="summary-head">
                    <div>
                      <p className="summary-kicker">Dzienny plan</p>
                      <h2>Cel wody</h2>
                    </div>
                    <span className="goal-prompt-unit">ml</span>
                  </div>
                  <input
                    className="summary-goal-input goal-prompt-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={waterGoal}
                    onChange={(e) =>
                      setWaterGoal(
                        Number(sanitizeGoalInput(e.target.value) || 0),
                      )
                    }
                    onBlur={handleWaterGoalBlur}
                  />
                  <p className="summary-value">
                    Dzisiaj wypite: {totalWater} ml
                  </p>
                  <div className="progressbar summary-progress water">
                    <div style={{ width: `${waterProgress}%` }} />
                  </div>
                </div>
              </div>
            </section>
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

          {/* 🔄 Spinner podczas szukania produktu w API */}
          {isSearchingProduct && (
            <div className="scanner-modal">
              <div className="scanner-shell" style={{ textAlign: "center" }}>
                <div className="scanner-copy">
                  <p className="scanner-kicker">Szukam produktu</p>
                  <h2>Chwileczkę...</h2>
                  <span>Sprawdzam bazy danych produktów.</span>
                </div>
                <div style={{ marginTop: "30px", fontSize: "40px" }}>
                  <i
                    className="fas fa-spinner"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                </div>
              </div>
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {detectedProduct && (
            <div className="type-modal">
              <div className="type-modal-content">
                <h3>Sprawdź i edytuj dane produktu</h3>

                {detectedProduct.fromCache && (
                  <p style={{ color: "green", fontSize: "12px" }}>
                    ✅ Dane z cache'u (zweryfikowano wcześniej)
                  </p>
                )}

                <div className="product-edit-form">
                  <label>
                    Nazwa produktu:
                    <input
                      type="text"
                      value={detectedProduct.name}
                      onChange={(e) =>
                        setDetectedProduct({
                          ...detectedProduct,
                          name: e.target.value,
                        })
                      }
                      placeholder="Nazwa produktu"
                    />
                  </label>

                  <label>
                    Kalorie na 100g:
                    <input
                      type="number"
                      value={detectedProduct.calories}
                      onChange={(e) =>
                        setDetectedProduct({
                          ...detectedProduct,
                          calories: Number(e.target.value),
                        })
                      }
                      placeholder="Kalorie"
                      min="0"
                      max="900"
                    />
                  </label>
                </div>

                <button
                  onClick={() => {
                    addScannedFood({
                      name: detectedProduct.name,
                      weight: 100,
                      calories: detectedProduct.calories,
                      barcode: detectedProduct.barcode,
                    });
                  }}
                >
                  🍽 To posiłek
                </button>

                <button
                  onClick={() => {
                    addScannedWater({
                      name: detectedProduct.name,
                      amount: 250,
                      barcode: detectedProduct.barcode,
                    });
                  }}
                >
                  🥤 To napój
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
