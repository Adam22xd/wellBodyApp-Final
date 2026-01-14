export default function CaloriesSection({
  calories,
  setCalories,
  calorieLimit,
  setCalorieLimit,
  getProgress,
}) {
  const handleAdd = () => setCalories((c) => c + 50);
  const handleRemove = () => setCalories((c) => (c > 0 ? c - 50 : 0));

  const progress = getProgress(calories, calorieLimit);

  return (
    <section className="sectioncalories">
      <div className="calories_main">
        <h2 className="calories-title">Kalorie</h2>

        <p className="counter">
          Zjedzono: {calories} / {calorieLimit} kcal
        </p>

        <input
          className="calories-input"
          type="number"
          value={calorieLimit}
          onChange={(e) => setCalorieLimit(Number(e.target.value))}
        />

        {/* PROGRESS BAR */}
        <div className="progress calorie-progress">
          <div
            className="progress-fill calorie-progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="buttons-container">
          <button className="waterplusmin" onClick={handleRemove}>
            -50
          </button>

          <button className="waterpluslitr" onClick={handleAdd}>
            +50
          </button>
        </div>
      </div>
    </section>
  );
}
