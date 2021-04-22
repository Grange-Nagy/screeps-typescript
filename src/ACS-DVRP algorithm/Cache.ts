import { Task } from "Task";
import { Problem } from "./Problem";

var taskManagerMemory = Game.spawns['Spawn1'].room.memory;
const RECALC_TIME = 200;
const DECAY = 1/250;



//access like masterCache[source][dest]
//keys are concat stringified room positions [cost, pheromone, last updated timestamp]

//need an adjustment formula as to not need to update matrix every cycle but still decay pheromone
//decay = 1/250
//pheromone = e^(-timeDelta*decay) * pheromone

export class Cache{

    store: Map<[RoomPosition,RoomPosition],[number, number, number]>;


    constructor(serial: string){
        if (serial == null || serial == undefined || serial == "{}"){
            this.store = new Map<[RoomPosition,RoomPosition],[number, number, number]>();
        }else{
            this.store = new Map(JSON.parse(serial));
        }
    }

    public serialize():string{
        //console.log(JSON.stringify(this.store));
        return JSON.stringify(this.store);
    }

    public getTuple(source: RoomPosition, dest: RoomPosition):[number, number, number] {
        let entry = this.store.get([source,dest]);

        if(entry){
            let time_since_last_update = Game.time - entry[2];
            if(time_since_last_update > RECALC_TIME){
                //recalculate cost
                entry[0] = PathFinder.search(source,dest).cost;
            }
            //update pheromone levels
            entry[1] = Math.exp(-time_since_last_update*DECAY) * entry[1];


        }else{
            let newEntry: [number, number, number] = [PathFinder.search(source,dest).cost, 0, Game.time];
            entry = newEntry;
        }

        this.store.set([source,dest],entry);
        console.log(JSON.stringify(this.store.get([source,dest])));
        return entry;

    }


    public updatePheromones(problem: Problem){
        let solution = problem.bestSolution;
    }


}
