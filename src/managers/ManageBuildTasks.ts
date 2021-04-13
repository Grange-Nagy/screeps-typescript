import { Task } from "Task";
import { Task_BuildStructure } from "tasks/Task_BuildStructure";


export function manageBuildTasks(spawn: StructureSpawn,
                                active_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                containerStates: Array<[Id<StructureContainer>, number, RoomPosition]>): Array<Task>{

    let newTasks: Array<Task> = [];



    let constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);

    //FOR EXPANSIONS
    //constructionSites.push(Game.constructionSites['8e577f9089a5ccf']);

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


    let roomContainers = [];
    roomContainers = containerStates.filter(ele => ele[2].roomName == spawn.room.name);

    let rc = spawn.room.controller;
    if((roomContainers == [] || roomContainers == undefined || roomContainers.length == 0) && rc != undefined){
        //console.log("%%%%%%%%%");
        roomContainers = containerStates.filter(ele => ele[2].inRangeTo((rc as StructureController).pos.x,(rc as StructureController).pos.y,100) );
    }

    for( let site of constructionSites){
        if(!activeSiteIds.includes(site.id) &&
           !queuedSiteIds.includes(site.id)){
            //console.log("%%%%%%%%% " + roomContainers.length);
            let sourceDest = PathFinder.search(site.pos,roomContainers.map(x => x[2])).path.pop();
            if (sourceDest != null){
                let sourceIndex = roomContainers.findIndex(x => x[2].isEqualTo(sourceDest as RoomPosition));
                //console.log("sourceIndex: " + sourceIndex);
                if(roomContainers[sourceIndex][1] > _.min([site.progressTotal - site.progress, 500])){
                    //console.log("build task est container stored closest: " + roomContainers[sourceIndex][1]);
                    newTasks.push(new Task_BuildStructure(roomContainers[sourceIndex][0], site, 2));
                    break;
                }
                let maxRoomContaineramm = roomContainers.reduce((a,b) => (a[1] > b[1]) ? a : b)[1];
                if(maxRoomContaineramm > _.min([site.progressTotal - site.progress, 500])){
                    //console.log("build task est container stored max: " + maxRoomContaineramm);
                    let maxRoomContainerID = roomContainers.reduce((a,b) => (a[1] > b[1]) ? a : b)[0];
                    newTasks.push(new Task_BuildStructure(maxRoomContainerID, site, 2));
                    break;
                }

            }



         }
    }

    return newTasks;


}
