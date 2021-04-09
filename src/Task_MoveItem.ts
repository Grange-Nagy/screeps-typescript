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
    this.requireResource = true;
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("hauler") && w.CARRY*50 > ammount).sort((a,b) => (a.CARRY - b.CARRY));
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


    }else{
        console.log("Worker carrying items between " + task.sourceID + " and " + task.destinationID + " cannot find one (destroyed?)");
        task.status = "COMPLETED";
    }

}
