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
            <span>{item.name}</span>
            <span className="history-amount">
              {item.weight} g · {item.calories} kcal
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
