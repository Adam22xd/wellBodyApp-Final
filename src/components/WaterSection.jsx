export default function waterSection({ 
  water, 
  waterLimit, 
  setWater, 
  getProgress,
}) {
  return(
    <section className="sectionwater">
    <div className="counter-container">
      <p className="waterlimittitle">Ustaw limit </p>
      <h1 className="counter">{water} l </h1>
      <div className="progress">
        <div
          className="waterprogress"
          style={{ width: `${getProgress(water, waterLimit)}%` }}
        ></div>
      </div>
      <p>
        {water.toFixed(2)} / {waterLimit} L
      </p>
      <div className="buttons-container">
        <button
        onClick={() => setWater((c) => c + 0.25)}>+0.25L
        </button>
        <button 
        onClick={() => setWater((c) => c + 0.5)}>+0.5L</button>
        <button 
        onClick={() => setWater((c) => c + 1)}>+1L</button>
        <button 
        onClick={() => setWater(0)}>Reset</button>
      </div>
    </div>
  </section>
  )  
  }
