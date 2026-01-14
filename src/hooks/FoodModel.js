export default class Food {
    constructor(name = "", weight = "", calories = "") {
        this.name = name;
        this.weight = weight;
        this.calories = calories;
        this.history = [];
    }

    add(name, weight, calories) {
        const entry = { name, weight, calories };
        this.history.push(entry);
        return entry;
    }

    clearInputs() {
        this.name = "";
        this.weight = "";
        this.calories = "";
    }

    


}
