import WeeklyOverview from "../../WeeklyOverview.jsx";

export default function DashboardSummary({
  selectedDate,
  totalCalories,
  calorieGoal,
  totalWater,
  waterGoal,
  caloriesProgress,
  waterProgress,
  onCalorieGoalChange,
  onWaterGoalChange,
  onCalorieGoalBlur,
  onWaterGoalBlur,
  foodItems,
  waterItems,
}) {
  return (
    <>
      <section className="dashboard-summary">
        <div className="summary-card">
          <div className="summary-head">
            <div>
              <p className="summary-kicker">Suma z posilkow</p>
              <h2>Kalorie</h2>
            </div>
            <input
              className="summary-goal-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={calorieGoal}
              onChange={onCalorieGoalChange}
              onBlur={onCalorieGoalBlur}
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
              <p className="summary-kicker">Suma z napojow</p>
              <h2>Woda</h2>
            </div>
            <input
              className="summary-goal-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={waterGoal}
              onChange={onWaterGoalChange}
              onBlur={onWaterGoalBlur}
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
  );
}
