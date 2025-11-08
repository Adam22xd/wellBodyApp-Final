export default function CaloriesSection({
  calories,
  calorieLimit,
  setCalories,
  setCalorieLimit,
  getProgress,
}) {
  return (
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
          <button onClick={() => setCalories((c) => Math.max(0, c - 50))}>
            -50 kcal
          </button>
          <button onClick={() => setCalories((c) => Math.max(0, c - 100))}>
            -100 kcal
          </button>
          <button onClick={() => setCalories((c) => c + 50)}>+50 kcal</button>
          <button onClick={() => setCalories((c) => c + 100)}>+100 kcal</button>
          <button onClick={() => setCalories((c) => c + 250)}>+250 kcal</button>
          <button onClick={() => setCalories(0)}>Reset</button>
        </div>
      </div>
    </section>
  );
}
