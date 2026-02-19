
export interface WaterEntry {
    name: string,
    amount: number,
};


export default class WaterModel {
    private history: WaterEntry[] = [];

    add(name:string, amount:number): WaterEntry {
        const entry = {name,amount};
        this.history.push(entry);
        return entry;
    }

    getHistory():WaterEntry[] {
        return this.history;
    }

    clear() : void {
        this.history = [];
    };


}



