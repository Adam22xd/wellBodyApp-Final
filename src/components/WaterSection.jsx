export default function WaterSection({ 
  water, 
  waterLimit, 
  setWater, 
  getProgress,
}) {
  return (
    <section className="sectionwater">
      <div className="water-container"> 
        <p className="waterlimittitle"> </p>
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
            onClick={() => setWater((c) => c + 0.25)}
            className="waterplusmin"
          >
            +0.25L
          </button>
          <button
            onClick={() => setWater((c) => c + 0.5)}
            className="waterplushalf"
          >
            +0.5L
          </button>
          <button
            onClick={() => setWater((c) => c + 1)}
            className="waterpluslitr"
          >
            +1L
          </button>
          <button onClick={() => setWater(0)} className="watertoreset">
            Reset
          </button>
        </div>

        
      </div>
    </section>
    
  );  
  }
