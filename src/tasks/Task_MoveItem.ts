import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";
import { Task } from "Task";
import { ALL } from "dns";



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
    resourceCost:      number;
    isInit:                 boolean;

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
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("hauler" || "builder") && w.CARRY*50 >= ammount).sort((a,b) => (a.categories.includes("hauler") ? 1 : (a.CARRY > b.CARRY) ? 1 : -1));
    //console.log("valid workers in move constructor: " + JSON.stringify(this.validWorkers));
    this.estRemainingTime = (PathFinder.search((Game.getObjectById(sourceID) as AnyStoreStructure).pos, (Game.getObjectById(destinationID) as AnyStoreStructure).pos)).cost;    //assuming speed 1

    this.sourceID = sourceID;
    this.destinationID = destinationID;
    this.ammount = ammount;
    this.itemType = itemType;
    this.hasItems = false;
    this.resourceCost = ammount;
    this.isInit = false;
    //this.beenToSource = false;
  }



}

export function runTask_MoveItem(taskOwner: Creep, task: Task_MoveItem) {




    //this is utterly fucking retarded
    let source = Game.getObjectById(task.sourceID);
    let dest = Game.getObjectById(task.destinationID);
    if(source && dest){

      if(!task.isInit){
        //if creep is holding something other than intended exceding intended delivery ammount
        if (taskOwner.store.getCapacity() - (taskOwner.store.getUsedCapacity() - taskOwner.store.getUsedCapacity(task.itemType)) > task.ammount){
          //find what it's holding
          let heldUnwanted = RESOURCES_ALL.filter(x => taskOwner.store.getUsedCapacity(x) > 0 && x != task.itemType);
          heldUnwanted.forEach(x => taskOwner.drop(x));
        }
        task.estRemainingTime += (PathFinder.search(taskOwner.pos,source.pos).cost);
        task.isInit = true;
      }


      //console.log("movecreep stored" + taskOwner.store[task.itemType] + ", requested: " + task.ammount);
      if(!task.hasItems && taskOwner.store[task.itemType] >= task.ammount){
          task.hasItems = true;
      }

      if(task.hasItems && taskOwner.store[task.itemType] < task.ammount){
        task.hasItems = false;
      }

      if(task.hasItems){
        task.resourceCost = 0;
          if (taskOwner.pos.isNearTo(dest)){
              task.status = "RUNNING";
              let err = taskOwner.transfer(dest,task.itemType,task.ammount);
              if(err != 0){
                if(err == -8){
                  taskOwner.transfer(dest,task.itemType);
                  //console.log("Move item time estimation error: " + task.estRemainingTime);
                  task.status = "COMPLETED";
                }else{

                  console.log("CREEP STUCK TRANSFFER: " + err)
                  task.status = "HALTED";
                }

              }
          }else{
              let err = taskOwner.travelTo(dest);
              //console.log("CREEP not?: " + err)
              if(err != 0 && err != -11){
                  console.log("CREEP STUCK: " + err)
                  task.status = "HALTED";
              }else{
              task.status = "RUNNING";
              }
          }
      }else{
          task.resourceCost = task.ammount;
          if (taskOwner.pos.isNearTo(source.pos)){
              let errCode = taskOwner.withdraw(source,task.itemType,task.ammount);
              if(errCode != 0 ){
                if(errCode == -8){
                  taskOwner.withdraw(source,task.itemType)
                  //console.log("movecreep " + taskOwner.name + " is to small for this move task")
                }else{
                  if(errCode == -6){
                    task.status = "HALTED";
                    //console.log("container empty, reallocate thsis creep");
                  }else{
                    console.log("moveitem err code: " + errCode);
                  }

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
      }



    }else{
        console.log("Worker carrying items between " + task.sourceID + " and " + task.destinationID + " cannot find one (destroyed?)");
        task.status = "COMPLETED";
    }

}
