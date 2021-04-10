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

  //-------------------------------------------

  nodeID:         Id<Source>;

  constructor(node: Source, containerPos: RoomPosition) {
    this.name = "jetcan_mine";
    this.status = "HALTED";
    this.taskLocation = containerPos;
    this.taskDestination = containerPos;
    this.priority = 1;
    this.isRepeatable = true;
    this.requireResource = false;
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("miner"));
    this.estRemainingTime = 99999999;
    this.nodeID = node.id;
  }



}

export function runTask_JetcanMine(taskOwner: Creep, task: Task_JetcanMine) {

    //this is utterly fucking retarded
    let maybeNode = Game.getObjectById(task.nodeID);
    if(maybeNode){
        let dest = new RoomPosition(task.taskLocation.x, task.taskLocation.y, task.taskLocation.roomName);
        if (taskOwner.pos.isEqualTo(dest)){
            //console.log(taskOwner.name + " is moving");
            task.status = "RUNNING";
            taskOwner.harvest(maybeNode);

        }else{
            if(taskOwner.travelTo(dest) != 0){
                task.status = "HALTED";
            }
            //console.log(taskOwner.name + " is jetcan mining");
        }
    }

}
