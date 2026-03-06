import { useState } from "react";

export default function useDrinks() {
  const [drinks, setDrinks] = useState<string[]>([]);
  const [newDrink, setNewDrink] = useState("");

  const addDrink = () => {
    const trimmed = newDrink.trim();
    if (!trimmed) return;

    setDrinks((prev) => [...prev, trimmed]);
    setNewDrink("");
  };

  const removeDrink = (index: number) => {
    setDrinks((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    drinks,
    newDrink,
    setNewDrink,
    addDrink,
    removeDrink,
  };
}
