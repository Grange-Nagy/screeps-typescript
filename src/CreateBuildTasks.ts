import { Task } from "Task";
import { Task_BuildStructure } from "Task_BuildStructure";


export function createBuildTasks(constructionSites: Array<ConstructionSite>,
                                active_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>): Array<Task>{

    let newTasks: Array<Task> = [];

    for( let site of constructionSites){
        if(active_tasks.findIndex(ele => ele[0].taskLocation == site.pos && ele[0].name == "build_structure") == -1 &&
         enqueued_tasks.findIndex(ele => ele[0].taskLocation == site.pos && ele[0].name == "build_structure") == -1){
            newTasks.push(new Task_BuildStructure(site, 2));
         }
    }

    return newTasks;


}
