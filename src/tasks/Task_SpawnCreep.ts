import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";
import { Task } from "Task";

export class Task_SpawnCreep implements Task {
    name: string; //name of task
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

  creep: WorkerType;

  constructor(taskLocation: RoomPosition, priority: number, requireResource: boolean, creep: WorkerType) {
    this.name = "spawn_creep";
    this.status = "HALTED";
    this.taskLocation = taskLocation;
    this.taskDestination = taskLocation;
    this.priority = priority;
    this.requireResource = requireResource;
    this.isRepeatable = false;
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("spawner"));
    this.estRemainingTime = 3 * creep.partSum;
    this.creep = creep;
    this.resourceCost = 0;
    this.isInit = false;
  }



}

export function runTask_SpawnCreep(taskOwner: StructureSpawn, task: Task_SpawnCreep) {

    if (!(taskOwner.spawning) && task.status == "RUNNING"){
        //console.log("Spawn time estimation error: " + task.estRemainingTime);
        task.status = "COMPLETED";
    }else{
        if (taskOwner.spawning) {
            task.estRemainingTime--;
            var spawningCreep = taskOwner.spawning.name;
            Game.creeps[spawningCreep].memory.type = task.creep;
            Game.creeps[spawningCreep].memory.tasks = [];
            taskOwner.room.visual.text("🛠️" + task.creep.name, taskOwner.pos.x + 1, taskOwner.pos.y, {
            align: "left",
            opacity: 0.8
            });
        } else {
            if (taskOwner.room.energyCapacityAvailable < task.creep.cost) {
                task.status = "HALTED";
            } else {
                var newName = task.creep.name + Game.time;
                var ret_code = taskOwner.spawnCreep(task.creep.stringRep, newName);

                if (ret_code == 0){
                    task.status = "RUNNING";
                }else{
                    if(ret_code == -6){
                        task.status = "COMPLETED";
                    } else{
                        task.status = "HALTED";
                    }

                }
            }
        }
    }
}

