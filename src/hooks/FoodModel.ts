export type FoodEntry = {
  name: string;
  weight: number;
  calories: number;
};

export default class FoodModel {
  private history: FoodEntry[] = [];

  add(name: string, weight: number, calories: number): FoodEntry {
    const entry = { name, weight, calories };
    this.history.push(entry);
    return entry;
  }

  getHistory(): FoodEntry[] {
    return this.history;
  }

  clear(): void {
    this.history = [];
  }
}
