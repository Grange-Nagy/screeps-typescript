import { manageRoomNodes } from "./managers/ManageRoomNodes";
import { Task } from "Task";
import { assignTasks } from "TaskAssigner";
import { manageBuildTasks } from "managers/ManageBuildTasks";
import { ErrorMapper } from "utils/ErrorMapper";
import { WorkerType } from "WorkerType";
import { manageRoomEnergy } from "./managers/ManageRoomEnergy";
import { Traveler } from "utils/Traveler";
import { manageRepairTasks } from "./managers/ManageRoomRepair";
import { Task_UpgradeController } from "./tasks/Task_UpgradeController";
import { runWorkers } from "RunWorkers";
import { getContainerStates } from "utils/getContainerStates";
import { manageControllerUpgrades } from "managers/ManageControllerUpgrades";

Traveler.init();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code


//push command:
//npm run push-pserver

declare global {

interface CreepMemory{
    tasks:  Array<Task>;
    type:   WorkerType;

  }

  interface SpawnMemory{
    tasks:  Array<Task>;
    type:   WorkerType;
    //ticksToLive: number = 999999;

  }

  interface RoomMemory{
    isGlobal:        boolean;

    sourceContainerAssignments: Array<[Id<Source>, RoomPosition]>;

  }

}


export const loop = ErrorMapper.wrapLoop(() => {
  //console.log(`Current game tic is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  //define global memory as room 1's
  var taskManagerMemory = Game.spawns['Spawn1'].room.memory;
  taskManagerMemory.isGlobal = true;
  if(!taskManagerMemory.sourceContainerAssignments){
    taskManagerMemory.sourceContainerAssignments = [];
  }


  var newTasks: Array<Task> = [];
  var currentWorkers: Array<Creep | StructureSpawn> = [];
  var active_tasks: Array<[Task, (Creep | StructureSpawn)]> = [];
  var enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]> = [];



  //run all of the workers, removing completed tasks and building active and enqueued task arrays
  runWorkers(currentWorkers,active_tasks,enqueued_tasks);


  //TODO: MAKE WORK FOR CONTAINERS THAT ARE NOT ENERGY
  var containerStates: Array<[Id<StructureContainer>, number, RoomPosition]> = getContainerStates(active_tasks,enqueued_tasks);

  let task_adj_container_cap = (containerStates[0][1] + containerStates[1][1]);
  console.log("task adjusted container capacity = " + task_adj_container_cap)






  //room manager
  for(let name in Game.spawns){
    let spawn = Game.spawns[name];
    let nodes = spawn.room.find(FIND_SOURCES);
    newTasks = newTasks.concat(manageRoomNodes(spawn, nodes, active_tasks));



    newTasks = newTasks.concat(manageBuildTasks         (spawn, active_tasks, enqueued_tasks));
    newTasks = newTasks.concat(manageRepairTasks        (spawn, active_tasks, enqueued_tasks));
    newTasks = newTasks.concat(manageRoomEnergy         (spawn, active_tasks, enqueued_tasks));
    newTasks = newTasks.concat(manageControllerUpgrades (spawn, containerStates));


  }
  //console.log("num new tasks this tick: " + newTasks.length);
  var unassignedTasks: Array<Task> = assignTasks(newTasks, currentWorkers, active_tasks, enqueued_tasks);

  //request more creeps


  for(let unassignedTask of unassignedTasks){

  }

});
