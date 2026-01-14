import usePersistentState from "./usePersistentState";

export default function useWater() {
    const [water, setWater] = usePersistentState("water", 0);
    const [waterLimit, setWaterLimit] = usePersistentState("waterLimit", 3);

    const addWater = (amount = 1) => setWater((w) => w + amount);
    const removeWater = (amount = 1) => setWater((w) => Math.max(0, w - amount));
    const resetWater = () => setWater(0);

    return { water, setWater, waterLimit, setWaterLimit, addWater, removeWater, resetWater };
}
