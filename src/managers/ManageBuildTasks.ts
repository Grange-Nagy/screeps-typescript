import { Task } from "Task";
import { Task_BuildStructure } from "tasks/Task_BuildStructure";


export function manageBuildTasks(spawn: StructureSpawn,
                                active_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                containerStates: Array<[Id<StructureContainer>, number, RoomPosition]>): Array<Task>{

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

    let roomContainers = containerStates.filter(ele => ele[2].roomName == spawn.room.name);

    for( let site of constructionSites){
        if(!activeSiteIds.includes(site.id) &&
           !queuedSiteIds.includes(site.id)){
            let sourceDest = site.pos.findClosestByPath(roomContainers.map(x => x[2]));

            if (sourceDest != null){
                let sourceIndex = roomContainers.findIndex(x => x[2].isEqualTo(sourceDest as RoomPosition));
                if(roomContainers[sourceIndex][1] > _.min([site.progressTotal, 500]) + 200){
                    //console.log("build task est container stored: " + roomContainers[sourceIndex][1]);
                    newTasks.push(new Task_BuildStructure(roomContainers[sourceIndex][0], site, 3));
                    break;
                }
                let maxRoomContaineramm = roomContainers.reduce((a,b) => (a[1] > b[1]) ? a : b)[1];
                if(maxRoomContaineramm > _.min([site.progressTotal, 500]) + 200){
                    let maxRoomContainerID = roomContainers.reduce((a,b) => (a[1] > b[1]) ? a : b)[0];
                    newTasks.push(new Task_BuildStructure(maxRoomContainerID, site, 3));
                }

            }



         }
    }

    return newTasks;


}
