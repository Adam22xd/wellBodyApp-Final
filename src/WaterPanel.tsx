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
      <button className="close-btn" onClick={onClose}>
        x
      </button>

      <h2 className="panel-title">{title}</h2>

      <div className="panel-row">
        <label>Nazwa</label>
        <input
          className="input-value"
          type="text"
          value={form.name}
          onChange={(e) => onUpdate("name", e.target.value)}
        />
      </div>

      <div className="panel-row">
        <label>Ilosc (ml)</label>
        <input
          className="input-value"
          type="number"
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

      <button className="primary-btn" onClick={onAdd}>
        {submitLabel}
      </button>
    </div>
  );
}
