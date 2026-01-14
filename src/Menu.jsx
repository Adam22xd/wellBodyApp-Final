import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Menu({
  isMenuOpen,
  onToggleMenu,
  onFoodSelect,
  onWaterSelect,
}) {
  return (
    <div className="burger-menu">
      {/* PRZYCISK ZAWSZE WIDOCZNY */}
      <button
        className={`burger-btn ${isMenuOpen ? "open" : ""}`}
        onClick={onToggleMenu}
      >
        <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`} />
        <span />
        <span />
        <span />
      </button>

      {/* PANEL TYLKO GDY OTWARTE */}
      {isMenuOpen && (
        <div className="burger-panel">
          <button className="burger-item" onClick={onFoodSelect}>
            🍽️ Posiłki
          </button>
          <button className="burger-item" onClick={onWaterSelect}>
            💧 Woda
          </button>
        </div>
      )}
    </div>
  );
}
