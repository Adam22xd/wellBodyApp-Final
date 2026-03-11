import FoodPanel from "../../FoodPanel";
import WaterPanel from "../../WaterPanel";
import {
  formatAddedTime,
  getTimeFrameLabel,
} from "../../utils/dashboard.js";

export default function TrackerSection({
  type,
  items,
  activePanel,
  editingId,
  foodForm,
  waterForm,
  onStartEdit,
  onDelete,
  onTogglePanel,
  onClosePanel,
  onUpdateFood,
  onUpdateWater,
  onAddFood,
  onAddWater,
}) {
  const isFood = type === "food";
  const title = isFood ? "Posilki" : "Napoje";
  const iconClass = isFood ? "fa-utensils" : "fa-glass-water";
  const emptyText = isFood ? "Brak posilkow" : "Brak napojow";
  const countLabel = isFood ? "posilkow" : "napojow";
  const panelVisible = activePanel === type;
  const form = isFood ? foodForm : waterForm;
  const submitLabel = editingId
    ? "Zapisz zmiany"
    : isFood
      ? "Dodaj produkt"
      : "Dodaj napoj";
  const panelTitle = editingId
    ? isFood
      ? "Edytuj posilek"
      : "Edytuj napoj"
    : title;

  return (
    <div className="dashboard-card dashboard-card-single">
      <h2>{title}</h2>
      <div className="card-icon">
        <i className={`fa-solid ${iconClass}`} />
      </div>

      <p>{items.length ? `${items.length} ${countLabel}` : emptyText}</p>

      {items.length > 0 && (
        <div className={isFood ? "food-list" : "water-list"}>
          {items.map((item) => {
            const timeLabel = getTimeFrameLabel(item.createdAt);
            const addedAt = formatAddedTime(item.createdAt);

            return (
              <div key={item.id} className={isFood ? "food-item" : "water-item"}>
                <div className="entry-main">
                  <strong>{item.name}</strong>
                  <span>{isFood ? `${item.weight} g` : `${item.amount} ml`}</span>
                  {isFood ? <span>{item.calories} kcal</span> : null}
                  <span className="time-frame-badge">{timeLabel}</span>
                  <span className="time-added">Dodano: {addedAt}</span>
                </div>
                <div className="entry-actions">
                  <button
                    type="button"
                    className="entry-action edit"
                    onClick={() => onStartEdit(item)}
                  >
                    Edytuj
                  </button>
                  <button
                    type="button"
                    className="entry-action delete"
                    onClick={() => onDelete(item.id)}
                  >
                    Usun
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {panelVisible &&
        (isFood ? (
          <FoodPanel
            model={form}
            onClose={onClosePanel}
            onUpdate={onUpdateFood}
            onAdd={onAddFood}
            title={panelTitle}
            submitLabel={submitLabel}
          />
        ) : (
          <WaterPanel
            form={form}
            onUpdate={onUpdateWater}
            onAdd={onAddWater}
            onClose={onClosePanel}
            title={panelTitle}
            submitLabel={submitLabel}
          />
        ))}

      <button className="toggle-btn" onClick={onTogglePanel}>
        + Add
      </button>
    </div>
  );
}
