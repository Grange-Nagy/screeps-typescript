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
  }



}

export function runTask_MoveItem(taskOwner: Creep, task: Task_MoveItem) {

    //this is utterly fucking retarded
    let source = Game.getObjectById(task.sourceID);
    let dest = Game.getObjectById(task.destinationID);
    if(source && dest){
      if(task.hasItems && taskOwner.pos.isNearTo(task.taskDestination as RoomPosition)){
        let err = taskOwner.transfer(dest, task.itemType, task.ammount);
        if (!err){
          task.status = "RUNNING";
        }else{
          task.status = "HALTED";
          console.log(taskOwner.name + " is failing to transfer with retcode: " + err);
        }
        task.status = "COMPLETED";
      }else{
        if(taskOwner.store[task.itemType] == task.ammount){
          task.hasItems = true;
          if(taskOwner.travelTo(dest.pos) == 0){
            task.status = "RUNNING";
          }else{
            task.status = "HALTED";
          }
        }
      }
      if(!task.hasItems){
        if(taskOwner.pos.isNearTo(task.taskLocation as RoomPosition)){
          let err = taskOwner.withdraw(source, task.itemType, task.ammount);
          if (!err){
            task.status = "RUNNING";
          }else{
            task.status = "HALTED";
            console.log(taskOwner.name + " is failing to withdraw with retcode: " + err);
          }
        }else{
          if(taskOwner.travelTo(source.pos) == 0){
            task.status = "RUNNING";
          }else{
            task.status = "HALTED";
          }
        }
      }



    }else{
        console.log("Worker carrying items between " + task.sourceID + " and " + task.destinationID + " cannot find one (destroyed?)");
        task.status = "COMPLETED";
    }

}
