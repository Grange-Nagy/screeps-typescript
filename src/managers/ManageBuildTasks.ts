import { Task } from "Task";
import { Task_BuildStructure } from "tasks/Task_BuildStructure";


export function manageBuildTasks(spawn: StructureSpawn,
                                active_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>): Array<Task>{

    let newTasks: Array<Task> = [];
    let constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);

    let activeSiteIds: Array<Id<ConstructionSite>> = [];
    for(let task of active_tasks){
        if(task[0] == undefined){continue;}
        if(task[0].name == "build_structure"){
            activeSiteIds.push((task[0] as Task_BuildStructure).constructionSiteID);
        }
    }
    let queuedSiteIds: Array<Id<ConstructionSite>> = [];
    for(let task of enqueued_tasks){
        if(task[0].name == "build_structure"){
            queuedSiteIds.push((task[0] as Task_BuildStructure).constructionSiteID);
        }
    }



    for( let site of constructionSites){
        if(!activeSiteIds.includes(site.id) &&
           !queuedSiteIds.includes(site.id)){


            newTasks.push(new Task_BuildStructure(site, 2));
         }
    }

    return newTasks;


}
