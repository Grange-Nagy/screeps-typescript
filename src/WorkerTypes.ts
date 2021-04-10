import {WorkerType} from "./WorkerType";

const part_costs = [100,50,50,80,150,250,600,10];
const part_names = ["WORK","MOVE","CARRY","ATTACK","RANGED_ATTACK","HEAL","CLAIM","TOUGH"]

export const WorkerTypes: Array<WorkerType> = [
    //spawner
    new WorkerType("small_spawner", ["spawner"], [0,1,0,0,0,0,0,0]),
    //new WorkerType("large_spawner", ["spawner"], [0,1,0,0,0,0,0,0]),

    //hauler
    new WorkerType("small_hauler", ["hauler"], [0,1,1,0,0,0,0,0]),
    new WorkerType("medium_hauler", ["hauler"], [0,2,2,0,0,0,0,0]),
    new WorkerType("large_hauler", ["hauler"], [0,3,3,0,0,0,0,0]),

    //builder
    new WorkerType("small_builder", ["builder"], [2,4,2,0,0,0,0,0]),
    //new WorkerType("small_long_range_builder", ["builder"],  [1,3,2,0,0,0,0,0]),

    //miner
    new WorkerType("small_jetcan_miner", ["miner"], [2,1,0,0,0,0,0,0])
    //new WorkerType("large_miner", ["miner"], [2,1,1,0,0,0,0,0])
    ]
