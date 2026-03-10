export interface FoodModel {
  name: string;
  weight: number;
  calories: number;
}

interface FoodProps {
  model: FoodModel;
  onClose: () => void;
  onUpdate: (field: keyof FoodModel, value: string | number) => void;
  onAdd: () => void;
  title?: string;
  submitLabel?: string;
}

export default function FoodPanel({
  model,
  onClose,
  onUpdate,
  onAdd,
  title = "Posilki",
  submitLabel = "Dodaj produkt",
}: FoodProps) {
  return (
    <div className="panel-card">
      <button className="close-btn" onClick={onClose}>
        x
      </button>

      <h2 className="panel-title">{title}</h2>

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
          onChange={(e) => onUpdate("weight", Number(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
            }
          }}
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>

      <div className="panel-row">
        <label>Kalorie</label>
        <input
          className="input-value"
          type="number"
          value={model.calories}
          onChange={(e) => onUpdate("calories", Number(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
            }
          }}
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>

      <button onClick={onAdd} className="add-btn">
        {submitLabel}
      </button>
    </div>
  );
}
