import { Position, SourceNode } from "source-map";
import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";
import { Task } from "./Task";



export class Task_JetcanMine implements Task {
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

  //-------------------------------------------

  nodeID:         Id<Source>;
  canID:          Id<StructureContainer>;

  constructor(node: Source, containerPos: RoomPosition, container: StructureContainer) {
    this.name = "jetcan_mine";
    this.status = "HALTED";
    this.taskLocation = containerPos;
    this.taskDestination = containerPos;
    this.priority = 3;
    this.isRepeatable = true;
    this.requireResource = false;
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("miner")).sort(((a, b) => a.WORK > b.WORK ? -1 : 1)); //sort decending
    this.estRemainingTime = 99999999;
    this.nodeID = node.id;
    this.canID = container.id;
    this.resourceCost = 0;


  }



}

export function runTask_JetcanMine(taskOwner: Creep, task: Task_JetcanMine) {

    //this is utterly fucking retarded
    let maybeNode = Game.getObjectById(task.nodeID);
    let maybeContainer = Game.getObjectById(task.canID);

    if(maybeContainer){
        if((maybeContainer.hitsMax - maybeContainer.hits) > 500 && taskOwner.store.energy >= 50){
            //console.log("miner repairing: " + maybeContainer.hits);
            let err = taskOwner.repair(maybeContainer);
            if (err != 0){
                console.log("miner rep err: " + err);
            }
        }
    }

    if(maybeNode){
        let dest = new RoomPosition(task.taskLocation.x, task.taskLocation.y, task.taskLocation.roomName);
        if (taskOwner.pos.isEqualTo(dest)){
            //console.log(taskOwner.name + " is moving");
            task.status = "RUNNING";
            taskOwner.harvest(maybeNode);

        }else{
            let err = taskOwner.travelTo(dest);
            if(err != 0 && err != -11){
                task.status = "HALTED";
                console.log("jetcan miner is halted err code " + err);
            }
            //console.log(taskOwner.name + " is jetcan mining");
        }
    }

}
