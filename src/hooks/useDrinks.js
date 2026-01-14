

import { useState } from "react";

export default function useDrinks() {
    const [drinks, setDrinks] = useState([]);
    const [newDrink, setNewDrink] = useState("");

    const addDrink = () => {
        if (newDrink.trim() !== "") {
            setDrinks((prev) => [...prev, newDrink]);
            setNewDrink("");
        }
    };

    const removeDrink = (index) => {
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