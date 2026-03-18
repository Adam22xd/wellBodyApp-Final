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
      <div className="tracker-header">
        <div>
          <p className="summary-kicker">Twoja lista dnia</p>
          <h2>{title}</h2>
        </div>
        <div className="card-icon">
          <i className={`fa-solid ${iconClass}`} />
        </div>
      </div>

      <p className="tracker-copy">
        {items.length
          ? `Masz zapisane ${items.length} ${countLabel}.`
          : `Na razie ${emptyText.toLowerCase()}.`}
      </p>

      {items.length > 0 && (
        <section className="tracker-list-shell">
          <div className="tracker-list-head">
            <p className="summary-kicker">Dodane wpisy</p>
            <span className="tracker-count">{items.length}</span>
          </div>

          <div className={isFood ? "food-list tracker-list" : "water-list tracker-list"}>
          {items.map((item) => {
            const timeLabel = getTimeFrameLabel(item.createdAt);
            const addedAt = formatAddedTime(item.createdAt);

            return (
              <div key={item.id} className={isFood ? "food-item" : "water-item"}>
                <div className="entry-main">
                  <div className="entry-title-row">
                    <strong>{item.name}</strong>
                    <span className="time-frame-badge">{timeLabel}</span>
                  </div>

                  <div className="entry-meta-row">
                    <span className="entry-stat">
                      {isFood ? `${item.weight} g` : `${item.amount} ml`}
                    </span>
                    {isFood ? (
                      <span className="entry-stat entry-stat-accent">
                        {item.calories} kcal
                      </span>
                    ) : null}
                  </div>

                  <span className="time-added">Dodano o {addedAt}</span>
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
        </section>
      )}

      {items.length === 0 && (
        <div className="tracker-empty">
          <p className="summary-kicker">Pusto na starcie</p>
          <h3>Dodaj pierwszy wpis z tego panelu.</h3>
          <p>
            Zacznij od jednego produktu albo jednego napoju. Reszta listy ulozy
            sie automatycznie ponizej.
          </p>
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
