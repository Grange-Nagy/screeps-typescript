import {WorkerType} from "./WorkerType";

//const part_costs = [100,     50,     50,     80,         150,        250,   600,    10];
//const part_names = ["WORK","MOVE","CARRY","ATTACK","RANGED_ATTACK","HEAL","CLAIM","TOUGH"]

export const WorkerTypes: Array<WorkerType> = [
    //spawner
    new WorkerType("small_spawner", ["spawner"], [0,1,0,0,0,0,0,0]),
    //new WorkerType("large_spawner", ["spawner"], [0,1,0,0,0,0,0,0]),

    //deprecated
    //new WorkerType("depreciated", ["hauler","builder","miner"], [1,1,1,0,0,0,0,0]),

    //hauler
    new WorkerType("small_hauler", ["hauler"], [0,1,1,0,0,0,0,0]),
    //new WorkerType("medium_hauler", ["hauler"], [0,2,2,0,0,0,0,0]),
    //new WorkerType("large_hauler", ["hauler"], [0,3,3,0,0,0,0,0]),

    //builder
    new WorkerType("tiny_builder", ["builder"], [1,2,2,0,0,0,0,0]),
    new WorkerType("small_builder", ["builder"], [2,4,2,0,0,0,0,0]),
    new WorkerType("large_builder", ["builder"], [2,6,4,0,0,0,0,0]),
    //new WorkerType("mondo_builder", ["builder"],  [3,10,7,0,0,0,0,0]),

    //miner
    new WorkerType("tiny_jetcan_miner", ["miner"], [2,1,1,0,0,0,0,0]),
    new WorkerType("small_jetcan_miner", ["miner"], [3,1,1,0,0,0,0,0]),
    new WorkerType("large_miner", ["miner"], [5,1,1,0,0,0,0,0]),
    //new WorkerType("mondo_miner", ["miner"], [7,1,1,0,0,0,0,0])


    //melee creeps
    new WorkerType("small_melee", ["melee","combat"], [0,6,0,3,0,0,0,3])


    ]
