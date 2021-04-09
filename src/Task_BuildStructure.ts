import { Position, SourceNode } from "source-map";
import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";
import { Task } from "./Task";



export class Task_BuildStructure implements Task {
    name: string;
    status: string;
    taskLocation: RoomPosition;
    taskDestination: RoomPosition;
    priority: number;
    requireResource: boolean;
    isRepeatable: boolean;
    validWorkers: Array<WorkerType>;
    estRemainingTime: number;

  //-------------------------------------------

    building:                   boolean;
    constructionSiteID:         Id<ConstructionSite>;
    timePassed:                 number;

  constructor(constructionSite: ConstructionSite, priority: number) {
    this.name = "build_structure";
    this.status = "HALTED";
    this.taskLocation = constructionSite.pos;
    this.taskDestination = constructionSite.pos;
    this.priority = priority;
    this.isRepeatable = true;
    this.requireResource = false;
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("builder"));
    this.estRemainingTime = (constructionSite.progressTotal / 4);                   //really rough estimation

    this.building = false;
    this.constructionSiteID = constructionSite.id;
    this.timePassed = 0;
  }



}

export function runTask_BuildStructure(taskOwner: Creep, task: Task_BuildStructure) {


    //this is utterly fucking retarded
    let maybeSite = Game.getObjectById(task.constructionSiteID);
    if(maybeSite){
        let dest = new RoomPosition(task.taskLocation.x, task.taskLocation.y, task.taskLocation.roomName);

        if(task.building && taskOwner.store[RESOURCE_ENERGY] == 0){
            task.building = false;
        }
        if(!task.building && taskOwner.store.getFreeCapacity() == 0){
            task.building = true;
        }

        if(task.building){
            if (taskOwner.pos.isEqualTo(dest)){
                task.status = "RUNNING";
                taskOwner.build(maybeSite);
            }else{
                if(taskOwner.moveTo(dest) != 0){
                    task.status = "HALTED";
                }else{
                task.status = "RUNNING";
                }
            }
        }else{
            let source = taskOwner.pos.findClosestByPath(taskOwner.room.find(FIND_STRUCTURES).filter(ele => ele.structureType == STRUCTURE_CONTAINER && ele.isActive));
            if(source){
                if (taskOwner.pos.isNearTo(source.pos)){
                    taskOwner.transfer(source,RESOURCE_ENERGY);
                }else{
                    if(taskOwner.moveTo(source.pos) != 0){
                        task.status = "HALTED";
                    }else{
                    task.status = "RUNNING";
                    }
                }
            }
        }



        task.timePassed++;
        let progressPercent = maybeSite.progress/maybeSite.progressTotal
        if (progressPercent > 0.15){
            task.estRemainingTime = (1 - progressPercent) / (progressPercent / task.timePassed);
        }



    }else{
        task.status = "COMPLETED";

    }

}
