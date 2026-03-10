const getDayKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createLastSevenDays = (selectedDate) => {
  const baseDate = new Date(`${selectedDate}T12:00:00`);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - (6 - index));
    return date;
  });
};

export default function WeeklyOverview({
  selectedDate,
  foodItems,
  waterItems,
}) {
  const days = createLastSevenDays(selectedDate);
  const dayStats = days.map((date) => {
    const key = getDayKey(date);
    const calories = foodItems
      .filter((item) => getDayKey(item.createdAt) === key)
      .reduce((sum, item) => sum + Number(item.calories || 0), 0);
    const water = waterItems
      .filter((item) => getDayKey(item.createdAt) === key)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      key,
      label: date.toLocaleDateString("pl-PL", { weekday: "short" }),
      calories,
      water,
    };
  });

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
