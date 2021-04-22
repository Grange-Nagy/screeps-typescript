import { Task } from "Task";
import { Cache } from "./Cache";
import { Problem } from "./Problem";

const Tac = 10;    //advanced commitment time, in ticks

var taskManagerMemory = Game.spawns['Spawn1'].room.memory;


//https://doc.rero.ch/record/312554/files/10878_2005_Article_4922.pdf
export function eventsManager(pendOrds: Array<Task>, currentWorkers: Array<Creep | StructureSpawn>){


    var worstCaseIterationTime = 100; //in ms
    var cache: Cache = new Cache(taskManagerMemory.cache);
    //var cache: Cache = new Cache("{}");
    const now = new Date();
    const startTime = now.getTime();

    //need to catch if a task does not have a valid worker
    pendOrds = pendOrds.filter(x => x.estRemainingTime < 9999);

    currentWorkers = currentWorkers.filter(x => (x.memory.tasks[0]) ? (x.memory.tasks[0].estRemainingTime < 9999) : true);
    //create the problem
    var staticProb = new Problem(pendOrds, currentWorkers);
    console.log("tasks to run: " + pendOrds.length + ", workers: " + currentWorkers.length);
    let cycles = 0;


    while(Game.cpu.getUsed() + worstCaseIterationTime < Game.cpu.tickLimit){

        staticProb.runACS(cache);
        //console.log("current winner: " + staticProb.bestSolution[0]);
        cycles++;
    }





    /*
    for(let i = 0; i < 10; i++){
        staticProb.runACS(cache);
        cycles++;
        //console.log("whiledata: " + (now.getTime() - startTime + worstCaseIterationTime) + " < " + Game.cpu.tickLimit);
    }
    */
    console.log("cycles run: " + cycles);
    console.log("tasks calced: " + pendOrds.length);

    //commit orders
    //staticProb.commit(Tac);

    //update pheromone matrix
    cache.updatePheromones(staticProb);

    //console.log("bestsol: " + JSON.stringify(staticProb.bestSolution[0]));

    //save cache
    taskManagerMemory.cache = cache.serialize();
}

