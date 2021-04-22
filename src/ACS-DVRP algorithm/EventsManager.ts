import { Task } from "Task";
import { Cache } from "./Cache";
import { Problem } from "./Problem";

const Tac = 20;    //advanced commitment time, in ticks

var taskManagerMemory = Game.spawns['Spawn1'].room.memory;


//https://doc.rero.ch/record/312554/files/10878_2005_Article_4922.pdf
export function eventsManager(pendOrds: Array<Task>, currentWorkers: Array<Creep | StructureSpawn>){


    var worstCaseIterationTime = 100; //in ms
    var cache: Cache = new Cache(taskManagerMemory.cache);
    const now = new Date();
    const startTime = now.getTime();

    //need to catch if a task does not have a valid worker

    //create the problem
    var staticProb = new Problem(pendOrds, currentWorkers);


    while(Game.cpu.getUsed() + worstCaseIterationTime < Game.cpu.tickLimit){


        let pre = now.getTime();
        staticProb.runACS(cache);
        //console.log("whiledata: " + (Game.cpu.getUsed() + worstCaseIterationTime) + " < " + Game.cpu.tickLimit);

    }


    /*
    for(let i = 0; i < 1000; i++){
        staticProb.runACS(cache);
        //console.log("whiledata: " + (now.getTime() - startTime + worstCaseIterationTime) + " < " + Game.cpu.tickLimit);
    }
    */

    //commit orders
    //staticProb.commit(Tac);

    //update pheromone matrix
    cache.updatePheromones(staticProb);

    console.log("bestsol: " + JSON.stringify(staticProb.bestSolution[0]));

    //save cache
    taskManagerMemory.cache = cache.serialize();
}

