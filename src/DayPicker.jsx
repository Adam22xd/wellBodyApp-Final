export default function DayPicker({
  selectedDate,
  dateInputRef,
  onChange,
}) {
  const openPicker = () => {
    if (!dateInputRef.current) return;

    dateInputRef.current.focus();

    if (typeof dateInputRef.current.showPicker === "function") {
      dateInputRef.current.showPicker();
      return;
    }

    dateInputRef.current.click();
  };

  return (
    <div className="day-picker">
      <button
        type="button"
        className="calendar-btn"
        onClick={openPicker}
        aria-label="Wybierz dzien"
        title="Wybierz dzien"
      >
        <i className="fa-regular fa-calendar-days" />
      </button>

      <input
        ref={dateInputRef}
        className="calendar-native-input"
        type="date"
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Wybierz dzien"
        tabIndex={-1}
      />
    </div>
  );
}
