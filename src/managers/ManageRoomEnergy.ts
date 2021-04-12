import { Task } from "Task";
import { Task_MoveItem } from "tasks/Task_MoveItem";

var taskManagerMemory = Game.spawns['Spawn1'].room.memory;

//const structuresToFeed =

export function manageRoomEnergy(spawn: StructureSpawn, active_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                                        enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                                        containerStates: Array<[Id<StructureContainer>, number, RoomPosition]>):Array<Task>{
    let newTasks: Array<Task> = [];


    //if all energy is in storage
    if(spawn.room.energyCapacityAvailable == spawn.room.energyAvailable){
        return [];
    }

    let needEnergy: Array<AnyStoreStructure>  = (spawn.room.find(FIND_STRUCTURES).filter(
                                                struct => (struct.structureType == STRUCTURE_EXTENSION ||
                                                           struct.structureType == STRUCTURE_SPAWN ||
                                                           struct.structureType == STRUCTURE_TOWER))) as Array<AnyStoreStructure>;



    //assign energy need to source
    var prio = 2;
    if (spawn.room.energyAvailable < spawn.room.energyCapacityAvailable){
        prio = 3;
    }else if(spawn.room.energyAvailable < 200){
        prio = 4;
    }
    //console.log("Need energy: " + JSON.stringify(needEnergy));

    let activeSiteIds: Array<Id<AnyStoreStructure>> = [];
    for(let task of active_tasks){
        if(task[0].name == "move_item"){
            activeSiteIds.push((task[0] as Task_MoveItem).destinationID);
        }
    }
    let queuedSiteIds: Array<Id<AnyStoreStructure>> = [];
    for(let task of enqueued_tasks){
        if(task[0].name == "move_item"){
            queuedSiteIds.push((task[0] as Task_MoveItem).destinationID);
        }
    }

    let roomContainers = containerStates.filter(ele => ele[2].roomName == spawn.room.name);

    for(let need of needEnergy){

        if(!activeSiteIds.includes(need.id) &&
           !queuedSiteIds.includes(need.id)){



            //console.log("debug");
            let needed = 0;
            if(need instanceof StructureSpawn){
                needed = 300 - need.store.energy;
            }else if(need instanceof StructureExtension){
                needed = 50 - need.store.energy;
            }else if(need instanceof StructureTower){
                needed = 1000 - need.store.energy;
            }else{
                continue;
            }
            if(needed <= 0){
                //console.log("somethings fucked above this");
                continue;
            }
            if(needed > 100){
                needed = 100;
            }

            let sourceDest = need.pos.findClosestByPath(roomContainers.map(x => x[2]));

            if (sourceDest != null){
                let sourceIndex = roomContainers.findIndex(x => x[2].isEqualTo(sourceDest as RoomPosition));
                if(roomContainers[sourceIndex][1] >= needed + 200){
                    //console.log("move task est container stored: " + roomContainers[sourceIndex][1]);
                    newTasks.push(new Task_MoveItem(roomContainers[sourceIndex][0], need.id, needed, RESOURCE_ENERGY, prio));
                    break;
                }
                let maxRoomContaineramm = roomContainers.reduce((a,b) => (a[1] > b[1]) ? a : b)[1];
                if(maxRoomContaineramm > needed + 200){
                    let maxRoomContainerID = roomContainers.reduce((a,b) => (a[1] > b[1]) ? a : b)[0];
                    newTasks.push(new Task_MoveItem(maxRoomContainerID, need.id, needed, RESOURCE_ENERGY, prio));
                }

            }


         }





    }







    return newTasks;
}
