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
      <button className="close-btn" onClick={onClose} type="button">
        x
      </button>

      <div className="panel-kicker">Food entry</div>
      <div className="panel-header">
        <h2 className="panel-title">{title}</h2>
        <p className="panel-copy">
          Dodaj produkt i od razu zapisz jego wage oraz kalorie.
        </p>
      </div>

      <div className="panel-row">
        <label htmlFor="food-name">Danie</label>
        <input
          id="food-name"
          className="input-value"
          type="text"
          placeholder="Np. owsianka z bananem"
          value={model.name}
          onChange={(e) => onUpdate("name", e.target.value)}
        />
      </div>

      <div className="panel-row">
        <label htmlFor="food-weight">Waga (g)</label>
        <input
          id="food-weight"
          className="input-value"
          type="number"
          placeholder="150"
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
        <label htmlFor="food-calories">Kalorie</label>
        <input
          id="food-calories"
          className="input-value"
          type="number"
          placeholder="320"
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

      <button onClick={onAdd} className="add-btn" type="button">
        {submitLabel}
      </button>
    </div>
  );
}
