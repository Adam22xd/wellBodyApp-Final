export interface WaterModel {
  name: string;
  amount: number;
}

interface WaterProps {
  form: WaterModel;
  onUpdate: (field: keyof WaterModel, value: string | number) => void;
  onAdd: () => void;
  onClose: () => void;
  title?: string;
  submitLabel?: string;
}

export default function WaterPanel({
  form,
  onUpdate,
  onAdd,
  onClose,
  title = "Napoje",
  submitLabel = "Dodaj napoj",
}: WaterProps) {
  if (!form) return null;

  return (
    <div className="panel-card">
      <button className="close-btn" onClick={onClose} type="button">
        x
      </button>

      <div className="panel-kicker">Water entry</div>
      <div className="panel-header">
        <h2 className="panel-title">{title}</h2>
        <p className="panel-copy">
          Zapisz napoj i ilosc, zeby aktualizowac nawodnienie bez liczenia recznie.
        </p>
      </div>

      <div className="panel-row">
        <label htmlFor="water-name">Nazwa</label>
        <input
          id="water-name"
          className="input-value"
          type="text"
          placeholder="Np. woda z cytryna"
          value={form.name}
          onChange={(e) => onUpdate("name", e.target.value)}
        />
      </div>

      <div className="panel-row">
        <label htmlFor="water-amount">Ilosc (ml)</label>
        <input
          id="water-amount"
          className="input-value"
          type="number"
          placeholder="500"
          value={form.amount}
          onChange={(e) => onUpdate("amount", Number(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
            }
          }}
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>

      <button className="add-btn" onClick={onAdd} type="button">
        {submitLabel}
      </button>
    </div>
  );
}
