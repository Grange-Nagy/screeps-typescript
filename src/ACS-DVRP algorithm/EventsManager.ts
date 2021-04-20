import { Task } from "Task";

const Tac = 5;    //advanced commitment time, in ticks

var taskManagerMemory = Game.spawns['Spawn1'].room.memory;


//https://doc.rero.ch/record/312554/files/10878_2005_Article_4922.pdf
export function eventsManager(preOrds: Array<Task>, currentWorkers: Array<Creep | StructureSpawn>){

    var time = 0
    var pendOrds: Array<Task> = preOrds;
    //get each worker location
    var staticProb;
    var newOrders:  Array<Task>;
    var commOrds: Array<Task>;

    var worstCaseIterationTime = 100; //in ms


    //for cache lookup, query helper array for indexes maybe use a map?
    //source = helperArray.findIndex(sourcePos)
    //dest =   helperArray.findIndex(destPos)
    var helperArray: Array<RoomPosition>;

    //access like masterCache[source][dest]
    //keys are concat stringified room positions [cost, pheromone, last updated timestamp]
    if (taskManagerMemory.cache == null){
        var cache = new Map<[RoomPosition,RoomPosition],[Number, Number, Number]>();
    }else{
        cache = new Map(JSON.parse(taskManagerMemory.cache));
    }


    //need an adjustment formula as to not need to update matrix every cycle but still decay pheromone
    //decay = 1/250
    //pheromone = e^(-timeDelta*decay) * pheromone

    const now = new Date();
    const startTime = now.getTime();

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


        staticProb = buildProblem(pendOrds)

        runACS(staticProb, cache);


        //update starting positions
        //update pheromone matrix


    }

    commOrds = getOrders(staticProb, time + (T/n_ts) + Tac)
    commitOrders(commOrds);
    pendOrds = pendOrds.filter(x => !commOrds.includes(x));
    pendOrds.concat(newOrders);

    taskManagerMemory.cache = JSON.stringify(cache);


}

