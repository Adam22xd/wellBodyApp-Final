export default class WaterModel {
    constructor(name,water) {
        this.name = name;
        this.water = water;
        this.result = [];
    }
    addProduct() {
        const date = {
                name: this.name,
                water: this.water,
        }
        return date;
    }
}

