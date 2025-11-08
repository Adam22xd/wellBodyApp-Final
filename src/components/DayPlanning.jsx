export default function DayPlanning({
  water,
  waterLimit,
  calories,
  calorieLimit,
  getProgress,
}) {
  return (
    <section className="workout-item">
      <div className="workout-card">
        <h2 className="workout-day">Day 1</h2>

        <div className="workout-stats">
          {/* Statystyka wody */}
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

          {/* Statystyka kalorii */}
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
  );
}
