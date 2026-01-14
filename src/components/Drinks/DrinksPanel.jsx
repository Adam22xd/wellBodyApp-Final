export default function DrinksPanel({
  newDrink,
  setNewDrink,
  drinks,
  addDrink,
}) {
  return (
    <div className="drinks-panel">
      <h2>Dodaj napój</h2>

      <input
        type="text"
        value={newDrink}
        onChange={(e) => setNewDrink(e.target.value)}
        placeholder="Wpisz napój..."
      />

      <button onClick={addDrink}>Dodaj</button>

      <ul>
        {drinks.map((drink, index) => (
          <li key={index}>{drink}</li>
        ))}
      </ul>
    </div>
  );
}
