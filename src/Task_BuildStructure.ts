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
    bootstrap: boolean;

  constructor(constructionSite: ConstructionSite, priority: number) {
    this.name = "build_structure";
    this.status = "HALTED";
    this.taskLocation = constructionSite.pos;
    this.taskDestination = constructionSite.pos;
    this.priority = priority;
    this.isRepeatable = true;
    this.requireResource = false;
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("builder"));
    this.estRemainingTime = (constructionSite.progressTotal);                   //really rough estimation

    this.building = false;
    this.constructionSiteID = constructionSite.id;
    this.timePassed = 0;
    this.bootstrap = false;
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
                if(taskOwner.travelTo(dest) != 0){
                    task.status = "HALTED";
                }else{
                task.status = "RUNNING";
                }
            }
        }else{
            let source = taskOwner.pos.findClosestByPath(taskOwner.room.find(FIND_STRUCTURES).filter(struct => <StructureConstant>struct.structureType == STRUCTURE_CONTAINER));
            if(source){
                if (taskOwner.pos.isNearTo(source.pos)){
                    let errCode = taskOwner.withdraw(source,RESOURCE_ENERGY);
                    if(errCode != 0 ){
                        console.log("build withdraw err " + errCode);
                    }
                }else{
                    if(taskOwner.travelTo(source.pos) != 0){
                        task.status = "HALTED";
                    }else{
                        //console.log("x: " + source.pos.x + " y: " + source.pos.y);
                        task.status = "RUNNING";
                    }
                }
            }else{
                console.log(taskOwner.name + " failed to find path to source to build " + task.constructionSiteID);
                task.bootstrap = true;
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
