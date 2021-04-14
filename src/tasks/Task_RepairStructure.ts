import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";
import { Task } from "Task";



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
    resourceCost:      number;
    isInit:                 boolean;

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
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("builder")).sort(((a, b) => a.partSum > b.partSum ? -1 : 1));
    this.estRemainingTime = _.min([(repairSite.hitsMax - repairSite.hits)/100,500]);;                   //really rough estimation

    this.repairing = false;
    this.structureID = repairSite.id;
    this.initHits = repairSite.hits;
    this.timePassed = 0;
    this.resourceCost = _.min([(repairSite.hitsMax - repairSite.hits)/100,500]);
    this.isInit = false;
  }



}

export function runTask_RepairStructure(taskOwner: Creep, task: Task_RepairStructure) {


    //this is utterly fucking retarded
    let maybeSite = Game.getObjectById(task.structureID);
    if(maybeSite){

        task.resourceCost = (maybeSite.hitsMax - maybeSite.hits)/100;

        let dest = new RoomPosition(task.taskLocation.x, task.taskLocation.y, task.taskLocation.roomName);
        if(task.repairing && taskOwner.store[RESOURCE_ENERGY] == 0){
            task.repairing = false;
        }
        if(!task.repairing && taskOwner.store.getFreeCapacity() == 0){
            task.repairing = true;
        }
        //console.log("err");
        if(task.repairing){
            if (taskOwner.pos.isNearTo(dest)){
                task.status = "RUNNING";
                let err = taskOwner.repair(maybeSite);
                if(err != 0){
                    console.log("repair err: " + err);
                }

            }else{
                let err = taskOwner.travelTo(dest);
                if(err != 0 && err != -11){
                    console.log("err travel repair: " + err);
                    task.status = "HALTED";
                }else{
                task.status = "RUNNING";
                }
            }
        }else{
            let source = taskOwner.pos.findClosestByPath(taskOwner.room.find(FIND_STRUCTURES).filter(struct => <StructureConstant>struct.structureType == STRUCTURE_CONTAINER));
            if(source){

                if(!task.isInit){
                    task.estRemainingTime += (PathFinder.search(taskOwner.pos,source.pos).cost);
                    task.isInit = true;
                  }

                if (taskOwner.pos.isNearTo(source.pos)){
                    let errCode = taskOwner.withdraw(source,RESOURCE_ENERGY);
                    if(errCode != 0 ){
                        if(errCode == ERR_NOT_ENOUGH_RESOURCES){
                            task.status = "COMPLETED";
                        }else{
                            console.log("err witdrawl reapair" + errCode);
                            task.status = "HALTED";
                        }

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
                console.log(taskOwner.name + " failed to find path to source to repair " + task.structureID);
            }
        }



        task.timePassed++;
        let progressPercent = (maybeSite.hits)/(maybeSite.hitsMax - task.initHits)
        if (progressPercent > 0.15){
            task.estRemainingTime = (1 - progressPercent) / (progressPercent / task.timePassed);
        }

        if(maybeSite.hits == maybeSite.hitsMax){
            //console.log("Repair time estimation error: " + task.estRemainingTime);
            task.status = "COMPLETED";
        }

    }else{
        task.status = "COMPLETED";

    }

}
