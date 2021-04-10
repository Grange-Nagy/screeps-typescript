import { Position, SourceNode } from "source-map";
import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";
import { Task } from "./Task";



export class Task_MoveItem implements Task {
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

    sourceID:                 Id<AnyStoreStructure>;
    destinationID:            Id<AnyStoreStructure>;
    ammount:                  number;
    itemType:                 ResourceConstant;
    hasItems:                 boolean;
    //beenToSource:                 boolean;


  constructor(sourceID: Id<AnyStoreStructure>, destinationID: Id<AnyStoreStructure>, ammount: number, itemType: ResourceConstant, priority: number) {
    this.name = "move_item";
    this.status = "HALTED";
    this.taskLocation = (Game.getObjectById(sourceID) as AnyStoreStructure).pos;
    this.taskDestination = (Game.getObjectById(destinationID) as AnyStoreStructure).pos;
    this.priority = priority;
    this.isRepeatable = true;
    this.requireResource = false;
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("hauler") && w.CARRY*50 > ammount).sort((a,b) => (a.CARRY - b.CARRY));
    //console.log("valid workers in move constructor: " + JSON.stringify(this.validWorkers));
    this.estRemainingTime = (PathFinder.search((Game.getObjectById(sourceID) as AnyStoreStructure).pos, (Game.getObjectById(destinationID) as AnyStoreStructure).pos)).cost;    //assuming speed 1

    this.sourceID = sourceID;
    this.destinationID = destinationID;
    this.ammount = ammount;
    this.itemType = itemType;
    this.hasItems = false;
    //this.beenToSource = false;
  }



}

export function runTask_MoveItem(taskOwner: Creep, task: Task_MoveItem) {

    //this is utterly fucking retarded
    let source = Game.getObjectById(task.sourceID);
    let dest = Game.getObjectById(task.destinationID);
    if(source && dest){


      //console.log("movecreep stored" + taskOwner.store[task.itemType] + ", requested: " + task.ammount);
      if(!task.hasItems && taskOwner.store[task.itemType] >= task.ammount){
          task.hasItems = true;
      }

      if(task.hasItems && taskOwner.store[task.itemType] < task.ammount){
        task.hasItems = false;
      }

      if(task.hasItems){
          if (taskOwner.pos.isNearTo(dest)){
              task.status = "RUNNING";
              let err = taskOwner.transfer(dest,task.itemType,task.ammount);
              if(err != 0){
                if(err == -8){
                  task.status = "COMPLETED";
                }else{
                  console.log("CREEP STUCK TRANSFFER: " + err)
                  task.status = "HALTED";
                }

              }
          }else{
              let err = taskOwner.travelTo(dest);
              console.log("CREEP not?: " + err)
              if(err != 0){
                  console.log("CREEP STUCK: " + err)
                  task.status = "HALTED";
              }else{
              task.status = "RUNNING";
              }
          }
      }else{
          if (taskOwner.pos.isNearTo(source.pos)){
              let errCode = taskOwner.withdraw(source,task.itemType);
              if(errCode != 0 ){
                if(errCode == -8){
                  task.hasItems = true;
                }
                  console.log("moveitem err code: " + errCode);
              }
          }else{
              if(taskOwner.travelTo(source.pos) != 0){
                  task.status = "HALTED";
              }else{
                  //console.log("x: " + source.pos.x + " y: " + source.pos.y);
                  task.status = "RUNNING";
              }
          }
      }



    }else{
        console.log("Worker carrying items between " + task.sourceID + " and " + task.destinationID + " cannot find one (destroyed?)");
        task.status = "COMPLETED";
    }

}
