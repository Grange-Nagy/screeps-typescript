import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";
import { Task } from "Task";



export class Task_GuardRoom implements Task {
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

    isRanged:           boolean;



  constructor(roomPos: RoomPosition, validWorker:WorkerType, priority: number) {
    this.name = "guaurd_room";
    this.status = "HALTED";
    this.taskLocation = roomPos;
    this.taskDestination = roomPos;
    this.priority = priority;
    this.isRepeatable = true;
    this.requireResource = false;
    this.validWorkers = [validWorker];
    //console.log("second valid workers in upgrade constructor's cost: " + this.validWorkers[1].cost);
    this.estRemainingTime = 9999999999;
    this.resourceCost = 0;          //estimate
    this.isInit = false;
    this.isRanged = validWorker.categories.includes("ranged");
  }



}

export function runTask_GuardRoom(taskOwner: Creep, task: Task_GuardRoom) {



    //this is utterly fucking retarded
    let source = Game.getObjectById(task.sourceID);
    let dest = Game.getObjectById(task.destinationID);


    task.estRemainingTime--;

    if(task.taskDestination.roomName){

      if(!task.isInit){
        task.estRemainingTime += (taskOwner.memory.type.CARRY*50 / taskOwner.memory.type.WORK)
                              +  (PathFinder.search(taskOwner.pos,source.pos).cost);
        task.isInit = true;
      }


      //console.log("upgradecreep stored" + taskOwner.store.energy + ", max: " + taskOwner.memory.type.CARRY*50);
      if(!task.hasEnergy && taskOwner.memory.type.CARRY*50 - taskOwner.store.energy == 0){
          task.hasEnergy = true;
      }



      if(task.hasEnergy){
        task.resourceCost = 0;
        let err = taskOwner.upgradeController(dest);
          if (err != ERR_NOT_IN_RANGE){

              taskOwner.travelTo(dest);
              task.status = "RUNNING";
              if(err != 0){
                if(err == -6){
                  taskOwner.transfer(dest,task.itemType);
                  task.status = "COMPLETED";
                }else{
                  console.log("CREEP STUCK UPGRADE: " + err)
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
        task.resourceCost = taskOwner.memory.type.CARRY*50;
          if (taskOwner.pos.isNearTo(source.pos)){
              let errCode = taskOwner.withdraw(source,task.itemType);
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
      if(task.hasEnergy && taskOwner.store.energy == 0){
        task.status = "COMPLETED";
        task.hasEnergy = false;
        //console.log("Upgrade controller time estimation error: " + task.estRemainingTime);
      }



    }else{
        console.log("Upgrader carrying items between " + task.sourceID + " and " + task.destinationID + " cannot find one (destroyed?)");
        task.status = "COMPLETED";
    }



}
