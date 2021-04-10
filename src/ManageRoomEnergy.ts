import { SourceNode } from "source-map";
import { Task } from "Task";
import { Task_JetcanMine } from "Task_JetcanMine";
import { Task_MoveItem } from "Task_MoveItem";

var taskManagerMemory = Game.spawns['Spawn1'].room.memory;

export function manageRoomEnergy(spawn: StructureSpawn, active_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                                        enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>):Array<Task>{
    let newTasks: Array<Task> = [];

    //if all energy is in storage
    if(spawn.room.energyCapacityAvailable = spawn.room.energyAvailable){
        return [];
    }
    let containers: Array<[StructureContainer, number, Array<AnyStoreStructure>]> = [];       //array of containers and their available energy
    //calculate energy in each container accounting for current tasks
    for(let containerName in Game.structures){
        if (spawn.room.find(FIND_STRUCTURES).filter(struct => taskManagerMemory.sourceContainerAssignments.findIndex(ele => ele[1] == struct.pos) != -1)){
            containers.push([Game.structures[containerName] as StructureContainer, (Game.structures[containerName] as StructureContainer).store.energy, []]);
        }
    }
    for (let task of active_tasks){
        let containerIndex = containers.findIndex(ele => ele[0].pos == task[0].taskDestination);
        if (containerIndex == -1){
            continue;
        }
        if(task[0] instanceof Task_MoveItem && task[0].itemType == RESOURCE_ENERGY){
            containers[containerIndex][1] -= task[0].ammount;

        }

    //needEnergy.sort((a,b) => (a as AnyStoreStructure).store.energy > (b as AnyStoreStructure).store.energy ? -1 : 1);




    }
    let needEnergy: Array<AnyStoreStructure>  = spawn.room.find(FIND_STRUCTURES).filter(
                                                struct => (struct.structureType == STRUCTURE_EXTENSION
                                                || struct.structureType == STRUCTURE_SPAWN)
                                                && struct.store.getFreeCapacity(RESOURCE_ENERGY) > 50) as Array<AnyStoreStructure>;

    //assign energy need to source
    var prio = 2;
    if (spawn.room.energyCapacityAvailable < 100){
        prio = 3;
    }

    for(let need of needEnergy){
        let path = PathFinder.search(need.pos, containers.map(x => x[0]).map(y => y.pos));
        if(path.path){
            for(let c of containers){
                if(c[0].pos.isNearTo(path.path[path.path.length - 1])){
                    newTasks.push(new Task_MoveItem(c[0].id, need.id,  need.store.getFreeCapacity(RESOURCE_ENERGY) % 50, RESOURCE_ENERGY, prio));
                }
            }
        }

    }







    return newTasks;
}
