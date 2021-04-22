import { worker } from "cluster";
import { noop } from "lodash";
import { Task } from "Task";
import { Problem } from "./Problem";

var taskManagerMemory = Game.spawns['Spawn1'].room.memory;
const RECALC_TIME = 100;
const CLEAR_TIME = 150;
const DECAY = 1/250;



//access like masterCache[source][dest]
//keys are concat stringified room positions [cost, pheromone, last updated timestamp]

//need an adjustment formula as to not need to update matrix every cycle but still decay pheromone
//decay = 1/250
//pheromone = e^(-timeDelta*decay) * pheromone


function replacer(key: any, value: any[]) {
    if(value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    } else {
      return value;
    }
  }
  function reviver(key: any, value: { dataType: string; value: Iterable<readonly [unknown, unknown]>; } | null) {
    if(typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }


export class Cache{


    store: Map<string,[number, number, number]>;

    cacheHit: number;
    cacheMiss: number;


    constructor(serial: string){

        this.cacheHit = 0;
        this.cacheMiss = 0;

        if (serial == null || serial == undefined || serial == "{}"){
            this.store = new Map<string,[number, number, number]>();
        }else{
            this.store = new Map(JSON.parse(serial, reviver));
            console.log("cache size: " + this.store.size);
        }
    }

    public serialize():string{
        console.log("cache hit: " + this.cacheHit + ", cache miss: " + this.cacheMiss);
        //return "{}";
        return JSON.stringify(this.store,replacer);
    }

    public getTuple(source: RoomPosition, dest: RoomPosition):[number, number, number] {
        let entry = this.store.get(JSON.stringify([source,dest]));

        if(entry){
            //console.log("cache hit!");
            this.cacheHit++;
            let time_since_last_update = Game.time - entry[2];
            if(time_since_last_update > RECALC_TIME){
                //recalculate cost
                entry[0] = PathFinder.search(source,dest).cost + 1;
                entry[2] = Game.time;
            }
            //update pheromone levels
            entry[1] = Math.exp(-time_since_last_update*DECAY) * entry[1];


        }else{
            this.cacheMiss++;
            let newEntry: [number, number, number] = [PathFinder.search(source,dest).cost + 1, 0, Game.time];
            entry = newEntry;
        }

        this.store.set(JSON.stringify([source,dest]),entry);
        //console.log(JSON.stringify(this.store.get(JSON.stringify([source,dest]))));
        return entry;

    }

    private incrementPheromones(source: RoomPosition, dest: RoomPosition) {
        let entry = this.store.get(JSON.stringify([source,dest]));

        if(entry){
            //update pheromone levels
            entry[1]++;

        }else{
            console.log("cache miss on incrementPheromones, this should not happen")
            let newEntry: [number, number, number] = [PathFinder.search(source,dest).cost + 1, 1, Game.time];
            entry = newEntry;
        }

        this.store.set(JSON.stringify([source,dest]),entry);
    }


    public updatePheromones(problem: Problem){
        let solution = problem.bestSolution[1];
        let counter = 0;
        let sumTask = 0;
        for(let worker of solution){
            if(worker[1].length == 0){
                continue;
            }
            sumTask += worker[1].length;
            let initLocation = worker[0].pos;
            //console.log("canary " + worker[1].length);
            this.incrementPheromones(initLocation,worker[1][0].taskLocation);
            //console.log("norm");
            counter++;
            for(let i = 1; i < worker[1].length; i++){

                this.incrementPheromones(worker[1][i - 1].taskDestination, worker[1][i].taskLocation);
                counter++;

            }

        }
        console.log("Incremented pheromones on " + counter + " edges " + sumTask + " tasks assigned");
    }

    public clean(){
        let t = Game.time;
        let numEntry = this.store.size;
        for(let entry of this.store){
            //console.log("sas");
            if(t - entry[1][2] > CLEAR_TIME){
                this.store.delete(entry[0]);
                this.cacheHit++;
            }else{
                this.cacheMiss++;
            }
        }

        console.log("Removed " + (numEntry - this.store.size) + " entries");



    }


}
