import DayPicker from "../../DayPicker.jsx";

export default function AppNavbar({
  isLoggedIn,
  selectedDate,
  dateInputRef,
  onDateChange,
  activeSection,
  isScannerOpen,
  onOpenSection,
  onOpenScanner,
  onLogout,
  onShowLogin,
  onShowRegister,
}) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo">
          <div className="logo-icon">💻</div>
          <span className="logo-text">Fitness List</span>
        </div>
      </div>

      <div className="nav-right">
        {isLoggedIn ? (
          <>
            <DayPicker
              selectedDate={selectedDate}
              dateInputRef={dateInputRef}
              onChange={onDateChange}
            />
            <button
              type="button"
              className={`nav-icon-btn ${activeSection === "food" ? "is-active" : ""}`}
              onClick={() => onOpenSection("food")}
              title="Posilki"
            >
              <i className="fa-solid fa-utensils" />
            </button>
            <button
              type="button"
              className={`nav-icon-btn ${activeSection === "water" ? "is-active" : ""}`}
              onClick={() => onOpenSection("water")}
              title="Napoje"
            >
              <i className="fa-solid fa-glass-water" />
            </button>
            <button
              type="button"
              className={`nav-icon-btn ${isScannerOpen ? "is-active" : ""}`}
              onClick={onOpenScanner}
              title="Skaner"
            >
              <i className="fa-solid fa-barcode" />
            </button>
            <span className="user-badge">PL</span>

            <button className="logout-btn" onClick={onLogout}>
              Wyloguj sie
            </button>
          </>
        ) : (
          <>
            <button className="log-btn" onClick={onShowLogin}>
              <span className="log-title">Zaloguj</span>
            </button>

            <button className="reg-btn" onClick={onShowRegister}>
              <span className="reg-title">Zarejestruj</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
