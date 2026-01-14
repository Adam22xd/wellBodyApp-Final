export default function FoodPanel({ model, onClose, toAdd, onUpdate }) {
  if (!model) return null;

  return (
    <div className="panel-card">
      <button className="close-btn" onClick={onClose}>
        ✕
      </button>

      <h2 className="panel-title">Panel jedzenia</h2>

      <div className="panel-row">
        <label>Danie</label>
        <input
          className="input-value"
          type="text"
          value={model.name}
          onChange={(e) => onUpdate("name", e.target.value)}
        />
      </div>

      <div className="panel-row">
        <label>Waga (g)</label>
        <input
          className="input-value"
          type="number"
          value={model.weight}
          onChange={(e) => onUpdate("weight", e.target.value)}
        />
      </div>

      <div className="panel-row">
        <label>Kalorie</label>
        <input
          className="input-value"
          type="number"
          value={model.calories}
          onChange={(e) => onUpdate("calories", e.target.value)}
        />
      </div>
      <button className="primary-btn" onClick={toAdd}>
        Dodaj produkt
      </button>
    </div>
  );
}
