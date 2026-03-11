import { getDateKey } from "./date.js";

export const createLastSevenDays = (selectedDate) => {
  const baseDate = new Date(`${selectedDate}T12:00:00`);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - (6 - index));
    return date;
  });
};

export const buildWeeklyStats = (selectedDate, foodItems, waterItems) => {
  const days = createLastSevenDays(selectedDate);

  return days.map((date) => {
    const key = getDateKey(date);
    const calories = foodItems
      .filter((item) => getDateKey(item.createdAt) === key)
      .reduce((sum, item) => sum + Number(item.calories || 0), 0);
    const water = waterItems
      .filter((item) => getDateKey(item.createdAt) === key)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      key,
      label: date.toLocaleDateString("pl-PL", { weekday: "short" }),
      calories,
      water,
    };
  });
};
