import { buildWeeklyStats } from "./utils/weeklyOverview.js";

export default function WeeklyOverview({
  selectedDate,
  foodItems,
  waterItems,
}) {
  const dayStats = buildWeeklyStats(selectedDate, foodItems, waterItems);

  const maxCalories = Math.max(...dayStats.map((day) => day.calories), 1);
  const maxWater = Math.max(...dayStats.map((day) => day.water), 1);

  return (
    <section className="weekly-overview">
      <div className="weekly-card">
        <div className="weekly-header">
          <div>
            <p className="summary-kicker">Ostatnie 7 dni</p>
            <h2>Kalorie</h2>
          </div>
        </div>
        <div className="weekly-bars">
          {dayStats.map((day) => (
            <div key={`cal-${day.key}`} className="weekly-bar-group">
              <div
                className="weekly-bar calories"
                style={{ height: `${Math.max((day.calories / maxCalories) * 100, 4)}%` }}
                title={`${day.calories} kcal`}
              />
              <span>{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="weekly-card">
        <div className="weekly-header">
          <div>
            <p className="summary-kicker">Ostatnie 7 dni</p>
            <h2>Woda</h2>
          </div>
        </div>
        <div className="weekly-bars">
          {dayStats.map((day) => (
            <div key={`water-${day.key}`} className="weekly-bar-group">
              <div
                className="weekly-bar water"
                style={{ height: `${Math.max((day.water / maxWater) * 100, 4)}%` }}
                title={`${day.water} ml`}
              />
              <span>{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
