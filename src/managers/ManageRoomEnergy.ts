import { Task } from "Task";
import { Task_MoveItem } from "tasks/Task_MoveItem";

var taskManagerMemory = Game.spawns['Spawn1'].room.memory;

export function manageRoomEnergy(spawn: StructureSpawn, active_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                                        enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>):Array<Task>{
    let newTasks: Array<Task> = [];


    //if all energy is in storage
    if(spawn.room.energyCapacityAvailable == spawn.room.energyAvailable){
        return [];
    }
    let containers: Array<[StructureContainer, number, Array<AnyStoreStructure>]> = [];       //array of containers and their available energy
    //calculate energy in each container accounting for current tasks
    let temp = spawn.room.find(FIND_STRUCTURES).filter(struct => <StructureConstant>struct.structureType == STRUCTURE_CONTAINER) as unknown;
    let containerList = temp as Array<StructureContainer>;
    for(let contain of containerList){
        if (taskManagerMemory.sourceContainerAssignments.findIndex(ele => ele[1] == contain.pos) != -1){
            containers.push([contain, contain.store.energy, []]);
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
    let needEnergy: Array<AnyStoreStructure>  = (spawn.room.find(FIND_STRUCTURES).filter(
                                                struct => (struct.structureType == STRUCTURE_EXTENSION
                                                || struct.structureType == STRUCTURE_SPAWN))) as Array<AnyStoreStructure>;



    //assign energy need to source
    var prio = 2;
    if (spawn.room.energyAvailable < 400){
        prio = 3;
    }else if(spawn.room.energyAvailable < 100){
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

    for(let need of needEnergy){

        if(!activeSiteIds.includes(need.id) &&
           !queuedSiteIds.includes(need.id)){
            //console.log("debug");
            let container = need.pos.findClosestByPath(spawn.room.find(FIND_STRUCTURES).filter(struct => struct.structureType == STRUCTURE_CONTAINER));
            let needed = 0;
            if(need instanceof StructureSpawn){
                needed = 300 - need.store.energy;
            }else if(need instanceof StructureExtension){
                needed = 50 - need.store.energy;
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
            //console.log("need: " + needed)
            //let capacityRounded50 = Math.round((need.store.getFreeCapacity(RESOURCE_ENERGY))/50)*50;
            if(container){
                newTasks.push(new Task_MoveItem((<StructureContainer>container).id, need.id, needed, RESOURCE_ENERGY, prio));
            }

         }





    }







    return newTasks;
}
