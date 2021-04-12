import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";
import { Task } from "Task";



export class Task_UpgradeController implements Task {
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
    destinationID:            Id<StructureController>;
    //ammount:                  number;
    itemType:                 ResourceConstant;
    hasEnergy:                 boolean;



  constructor(sourceID: Id<AnyStoreStructure>, destinationID: Id<StructureController>, priority: number) {
    this.name = "upgrade_controller";
    this.status = "HALTED";
    this.taskLocation = (Game.getObjectById(sourceID) as AnyStoreStructure).pos;
    this.taskDestination = (Game.getObjectById(destinationID) as StructureController).pos;
    this.priority = priority;
    this.isRepeatable = true;
    this.requireResource = false;
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("builder")).sort(((a, b) => a.partSum > b.partSum ? -1 : 1)); //sort decending
    //console.log("second valid workers in upgrade constructor's cost: " + this.validWorkers[1].cost);
    this.estRemainingTime = (PathFinder.search((Game.getObjectById(sourceID) as AnyStoreStructure).pos, (Game.getObjectById(destinationID) as StructureController).pos)).cost;    //assuming speed 1

    this.sourceID = sourceID;
    this.destinationID = destinationID;
    //this.ammount = ammount;
    this.itemType = RESOURCE_ENERGY;
    this.hasEnergy = false;
    this.resourceCost = 100;          //estimate
    this.isInit = false;
  }



}

export function runTask_UpgradeController(taskOwner: Creep, task: Task_UpgradeController) {



    //this is utterly fucking retarded
    let source = Game.getObjectById(task.sourceID);
    let dest = Game.getObjectById(task.destinationID);


    task.estRemainingTime--;

    if(source && dest){

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
              if(err != 0){
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
        taskOwner.say("time: " + task.estRemainingTime.toString());
      }



    }else{
        console.log("Upgrader carrying items between " + task.sourceID + " and " + task.destinationID + " cannot find one (destroyed?)");
        task.status = "COMPLETED";
    }



}
