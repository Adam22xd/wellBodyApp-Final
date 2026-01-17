export default function WaterList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="history">
        <h3 className="history-title">Brak napojów</h3>
      </div>
    );
  }

  return (
    <div className="history">
      <h3 className="history-title">Historia nawodnienia</h3>

      <ul className="history-list">
        {items.map((item, index) => (
          <li key={index} className="history-item">
            <span>{item.name}</span>
            <span className="history-amount">
              </span>
              <span className="water-counter">

              {item.amount} ml
              </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
