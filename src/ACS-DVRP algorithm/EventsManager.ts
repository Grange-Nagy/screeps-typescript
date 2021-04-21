import { Task } from "Task";
import { Cache } from "./Cache";

const Tac = 5;    //advanced commitment time, in ticks

var taskManagerMemory = Game.spawns['Spawn1'].room.memory;


//https://doc.rero.ch/record/312554/files/10878_2005_Article_4922.pdf
export function eventsManager(pendOrds: Array<Task>, currentWorkers: Array<Creep | StructureSpawn>){

    var staticProb;
    var commOrds: Array<Task>;

    var worstCaseIterationTime = 100; //in ms

    var cache: Cache = new Cache(taskManagerMemory.cache);


    const now = new Date();
    const startTime = now.getTime();


    //create the problem
    staticProb = new Problem(pendOrds, currentWorkers);

    while(startTime - now.getTime() + worstCaseIterationTime < Game.cpu.tickLimit){
        //need a solution class or some string representation
        //how do I select which worker to search?
        //let worstTime = min(workerRoutes.time)
        //while(there are unreached tasks){
            //select a worker (how?)
            //calculate weights for all possible tasks
                //weight = (pheromone - recent) / distance
            //select highest
            //remove task from pool

        }



        runACS(staticProb, cache);


        //update starting positions
        //update pheromone matrix

        //save cache
        taskManagerMemory.cache = cache.serialize();
    }

    commOrds = getOrders(staticProb, time + (T/n_ts) + Tac)
    commitOrders(commOrds);
    pendOrds = pendOrds.filter(x => !commOrds.includes(x));
    pendOrds.concat(newOrders);




}

