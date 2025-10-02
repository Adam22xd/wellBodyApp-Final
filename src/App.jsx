import { useState, useEffect } from "react";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const [activeSection, setActiveSection] = useState("");

  const [water, setWater] = useState(() => {
    return Number(localStorage.getItem("water")) || 0;
  });
  const [waterLimit, setWaterLimit] = useState(() => {
    return Number(localStorage.getItem("waterLimit")) || 3;
  });

  const [calories, setCalories] = useState(() => {
    return Number(localStorage.getItem("calories")) || 0;
  });
  const [calorieLimit, setCalorieLimit] = useState(() => {
    return Number(localStorage.getItem("calorieLimit")) || 400;
  });

  useEffect(() => {
    localStorage.setItem("water", water);
  }, [water]);

  useEffect(() => {
    localStorage.setItem("waterLimit", waterLimit);
  }, [waterLimit]);

  useEffect(() => {
    localStorage.setItem("calories", calories);
  }, [calories]);

  useEffect(() => {
    localStorage.setItem("calorieLimit", calorieLimit);
  }, [calorieLimit]);

  const getProgress = (current, limit) => {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
  };

  return (
    <div className="main-icon">
      <nav className="navbar">
        {/* Nawigacja */}
        <div className="nav-items">
          <div
            className="nav-item"
            onClick={() =>
              setActiveSection(activeSection === "water" ? null : "water")
            }
            title="Woda"
          >
            <i className="fa-solid fa-bottle-water">NAWODNIENIE</i>
          </div>
          <div
            className="nav-item-calories"
            onClick={() =>
              setActiveSection(activeSection === "fire" ? null : "fire")
            }
            title="Kalorie"
          >
            🔥KCAL
          </div>
          <div
            className="nav-item-check"
            onClick={() =>
              setActiveSection(activeSection === "workout" ? null : "workout")
            }
          >
            🏋️PLAN DNIA
          </div>
        </div>

        {/* Sekcja Woda inicjacja jsx */}
        {activeSection === "water" && (
          <section className="sectionwater">
            <div className="counter-container">
              <p className="waterlimittitle">Ustaw limit </p>
              <h1 className="counter">{water} l </h1>

              <div className="progress">
                <div
                  className="progress-fill water-progress"
                  style={{ width: `${getProgress(water, waterLimit)}%` }}
                ></div>
              </div>
              <p>
                {water.toFixed(2)} / {waterLimit} L
              </p>

              <div className="buttons-container">
                <button onClick={() => setWater((c) => c + 0.25)}>
                  +0.25L
                </button>
                <button onClick={() => setWater((c) => c + 0.5)}>+0.5L</button>
                <button onClick={() => setWater((c) => c + 1)}>+1L</button>
                <button onClick={() => setWater(0)}>Reset</button>
              </div>
            </div>
          </section>
        )}

        {/* Sekcja Kalorie */}
        {activeSection === "fire" && (
          <section className="sectioncalories">
            <div className="calories_main">
              <h2 className="calories-title">Cel kaloryczny</h2>

              <div className="limit-buttons">
                <button onClick={() => setCalorieLimit(2000)}>2000 kcal</button>
                <button onClick={() => setCalorieLimit(2500)}>2500 kcal</button>
                <button onClick={() => setCalorieLimit(3000)}>3000 kcal</button>
              </div>

              <input
                type="number"
                value={calorieLimit.toFixed(0)}
                onChange={(e) => setCalorieLimit(Number(e.target.value))}
                placeholder="Ustaw limit"
                className="calories-input"
              />

              <div className="progress">
                <div
                  className="progress-fill calorie-progress"
                  style={{ width: `${getProgress(calories, calorieLimit)}%` }}
                ></div>
              </div>

              <p>
                {calories} / {calorieLimit} kcal
              </p>

              <div className="buttons-container">
                <button
                  onClick={() => setCalorieLimit((c) => Math.max(0, c - 50))}
                >
                  {" "}
                  -50{" "}
                </button>
                <button
                  onClick={() => setCalorieLimit((c) => Math.max(0, c - 100))}
                >
                  {" "}
                  -100{" "}
                </button>
                <button
                  onClick={() => setCalorieLimit((c) => Math.max(0, c + 50))}
                >
                  {" "}
                  +50{" "}
                </button>
                <button
                  onClick={() => setCalorieLimit((c) => Math.max(0, c + 100))}
                >
                  {" "}
                  +100{" "}
                </button>
                <button
                  onClick={() => setCalorieLimit((c) => Math.max(0, c + 250))}
                >
                  {" "}
                  +250{" "}
                </button>
                <button onClick={() => setCalorieLimit(0)}>reset</button>
              </div>
            </div>
          </section>
        )}

        {/* Sekcja Workout */}
        {activeSection === "workout" && (
          <section className="workout-item">
            <div className="workout-card">
              <h2 className="workout-day">Day 1</h2>

              <div className="workout-stats">
                <div className="stat water-stat">
                  <span>Woda</span>
                  <p>
                    {water.toFixed(2)} / {waterLimit} L
                  </p>
                  <div className="progress">
                    <div
                      className="progress-fill water-progress"
                      style={{ width: `${getProgress(water, waterLimit)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="stat calorie-stat">
                  <span>Kalorie</span>
                  <p>
                    {calories} / {calorieLimit} kcal
                  </p>
                  <div className="progress">
                    <div
                      className="progress-fill calorie-progress"
                      style={{
                        width: `${getProgress(calories, calorieLimit)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <button className="daydone">Cel na dziś</button>
            </div>
          </section>
        )}
      </nav>
    </div>
  );
}

export default App;
