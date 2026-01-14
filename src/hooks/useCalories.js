import usePersistentState from "./usePersistentState";

export default function useCalories() {
    const [calories, setCalories] = usePersistentState("calories", 0);
    const [calorieLimit, setCalorieLimit] = usePersistentState("calorieLimit", 400);

    const addCalories = (amount = 50) => setCalories((c) => c + amount);
    const removeCalories = (amount = 50) => setCalories((c) => Math.max(0, c - amount));
    const resetCalories = () => setCalories(0);

    return {
        calories,
        setCalories,
        calorieLimit,
        setCalorieLimit,
        addCalories,
        removeCalories,
        resetCalories,
    };
}
