export default function DayPlanning({
  water,
  waterLimit,
  calories,
  calorieLimit,
  getProgress,
}) {
  const waterProgress = getProgress(water, waterLimit);
  const calorieProgress = getProgress(calories, calorieLimit);

  return (
    <section className="day-planning">
      <h2>Podsumowanie dnia</h2>

      <div className="summary-box">
        <h3>Nawodnienie</h3>
        <p>
          {water} / {waterLimit} L
        </p>
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${waterProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="summary-box">
        <h3>Kalorie</h3>
        <p>
          {calories} / {calorieLimit} kcal
        </p>
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${calorieProgress}%` }}
          ></div>
        </div>
      </div>
    </section>
  );
}
