export interface WaterModel {
  name: string,
  amount:number,
};


interface WaterProps {
  form: WaterModel;
  onUpdate: (field: keyof WaterModel, value: string | number) => void;
  onAdd: () => void;
  onClose: () => void;
}

export default function WaterPanel({
  form,
  onUpdate,
  onAdd,
  onClose,
}: WaterProps) {
  if (!form) return null;

  return (
    <div className="panel-card">
      <button className="close-btn" onClick={onClose}>
        ✕
      </button>

      <h2 className="panel-title">Napoje</h2>

      <div className="panel-row">
        <label>Nazwa</label>
        <input
          className="input-value"
          type="text"
          value={form.name}
          onChange={(e) => onUpdate("name", (e.target.value))}
        />
      </div>

      <div className="panel-row">
        <label>Ilość (ml)</label>
        <input
          className="input-value"
          type="number"
          value={form.amount}
          onChange={(e) => onUpdate("amount", (e.target.value))}
        />
      </div>

      <button className="primary-btn" onClick={onAdd}>
        
        Dodaj napój
      </button>
    </div>
  );
}
