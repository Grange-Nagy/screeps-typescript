import { Task } from "Task";
import { Task_BuildStructure } from "Task_BuildStructure";
import { Task_RepairStructure } from "Task_RepairStructure";


export function createRepairTasks(spawn: StructureSpawn,
                                  active_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                  enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>): Array<Task>{

    let newTasks: Array<Task> = [];

    let activeSiteIds: Array<Id<Structure>> = [];
    for(let task of active_tasks){
        if(task[0].name == "repair_structure"){
            activeSiteIds.push((task[0] as Task_RepairStructure).structureID);
        }
    }
    let queuedSiteIds: Array<Id<Structure>> = [];
    for(let task of enqueued_tasks){
        if(task[0].name == "repair_structure"){
            queuedSiteIds.push((task[0] as Task_RepairStructure).structureID);
        }
    }

    let structures = spawn.room.find(FIND_STRUCTURES).filter(struct => (struct.hitsMax - struct.hits) > 500 && struct.structureType != STRUCTURE_CONTAINER);


    for( let site of structures){
        if(!activeSiteIds.includes(site.id) &&
           !queuedSiteIds.includes(site.id)){


            newTasks.push(new Task_RepairStructure(site, 1));
         }
    }

    return newTasks;


}
