export const sanitizeGoalInput = (value) => value.replace(/\D/g, "");

export const getTimeFrameLabel = (dateValue) => {
  if (!dateValue) return "Brak godziny";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Brak godziny";

  const hour = date.getHours();

  if (hour >= 6 && hour < 10) return "Sniadanie (6:00-10:00)";
  if (hour >= 10 && hour < 14) return "Obiad (10:00-14:00)";
  if (hour >= 14 && hour < 16) return "Podwieczorek (14:00-16:00)";
  if (hour >= 16 && hour < 19) return "Kolacja (16:00-19:00)";

  return "Poza planem";
};

export const formatAddedTime = (dateValue) => {
  if (!dateValue) return "--:--";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
