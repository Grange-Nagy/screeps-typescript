import { Position, SourceNode } from "source-map";
import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";
import { Task } from "./Task";



export class Task_RepairStructure implements Task {
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

  repairing:                   boolean;
    structureID:         Id<AnyStructure>;
    initHits:                   number;
    timePassed:                 number;

  constructor(repairSite: AnyStructure, priority: number) {
    this.name = "repair_structure";
    this.status = "HALTED";
    this.taskLocation = repairSite.pos;
    this.taskDestination = repairSite.pos;
    this.priority = priority;
    this.isRepeatable = true;
    this.requireResource = false;
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("builder"));
    this.estRemainingTime = (repairSite.hitsMax - repairSite.hits);                   //really rough estimation

    this.repairing = false;
    this.structureID = repairSite.id;
    this.initHits = repairSite.hits;
    this.timePassed = 0;
  }



}

export function runTask_RepairStructure(taskOwner: Creep, task: Task_RepairStructure) {


    //this is utterly fucking retarded
    let maybeSite = Game.getObjectById(task.structureID);
    if(maybeSite){



        let dest = new RoomPosition(task.taskLocation.x, task.taskLocation.y, task.taskLocation.roomName);
        if(task.repairing && taskOwner.store[RESOURCE_ENERGY] == 0){
            task.repairing = false;
        }
        if(!task.repairing && taskOwner.store.getFreeCapacity() == 0){
            task.repairing = true;
        }
        //console.log("err");
        if(task.repairing){
            if (taskOwner.pos.isEqualTo(dest)){
                task.status = "RUNNING";
                taskOwner.repair(maybeSite);
                //console.log("err");
            }else{
                let err = taskOwner.travelTo(dest);
                if(err != 0){
                    console.log("err travel repair: " + err);
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
                        console.log("err witdrawl reapair" + errCode);
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
                console.log(taskOwner.name + " failed to find path to source to build " + task.structureID);
            }
        }



        task.timePassed++;
        let progressPercent = (maybeSite.hits)/(maybeSite.hitsMax - task.initHits)
        if (progressPercent > 0.15){
            task.estRemainingTime = (1 - progressPercent) / (progressPercent / task.timePassed);
        }

        if(maybeSite.hits == maybeSite.hitsMax){
            task.status = "COMPLETED";
        }

    }else{
        task.status = "COMPLETED";

    }

}
