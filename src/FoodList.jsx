export default function FoodList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="history">
        <h3 className="history-title">Brak posiłków</h3>
      </div>
    );
  }

  return (
    <div className="history">
      <h3 className="history-title">Historia posiłków</h3>

      <ul className="history-list">
        {items.map((item, index) => (
          <li key={index} className="history-item">
            <span className="history-amount">
              <div className="history-name">{item.name}</div>
              <div className="history-weight">{item.weight} g</div>
              <div className="history-calories">{item.calories} kcal</div>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
