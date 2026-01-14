export default function WaterSection({
  water,
  waterLimit,
  setWater,
  getProgress,
}) {
  const handleAdd = () => setWater((w) => w + 0.5);
  const handleAddLiter = () => setWater((w) => w + 1);
  const handleRemove = () => setWater((w) => (w > 0 ? w - 0.5 : 0));
  const handleReset = () => setWater(0);

  const progress = getProgress(water, waterLimit);

  return (
    <section className="sectionwater">
      <div className="water-section-card">
        <h2 className="waterlimittitle">Nawodnienie</h2>

        <p className="counter">
          Wypito: {water} / {waterLimit} L
        </p>

        {/* Progress bar */}
        <div className="progress water-progress">
          <div
            className="progress-fill water-progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Buttons */}
        <div className="buttons-container">
          <button className="waterplusmin" onClick={handleRemove}>
            -0.5
          </button>

          <button className="waterplushalf" onClick={handleAdd}>
            +0.5
          </button>

          <button className="waterpluslitr" onClick={handleAddLiter}>
            +1
          </button>

          <button className="watertoreset" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
