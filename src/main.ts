import { manageRoomNodes } from "./managers/ManageRoomNodes";
import { Task } from "Task";
import { assignTasks } from "TaskAssigner";
import { manageBuildTasks } from "managers/ManageBuildTasks";
import { ErrorMapper } from "utils/ErrorMapper";
import { WorkerType } from "WorkerType";
import { manageRoomEnergy } from "./managers/ManageRoomEnergy";
import { Traveler } from "utils/Traveler";
import { manageRepairTasks } from "./managers/ManageRoomRepair";
import { runWorkers } from "RunWorkers";
import { getContainerStates } from "utils/getContainerStates";
import { manageControllerUpgrades } from "managers/ManageControllerUpgrades";
import { Task_BuildStructure } from "tasks/Task_BuildStructure";

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
  //establish spawner
  let x = Game.rooms['W1N2'].controller;
  if(x){
    //Game.creeps['con'].claimController(x);
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

  var temp = Game.getObjectById('8e577f9089a5ccf' as Id<ConstructionSite>);
  if(temp &&Game.time % 10 == 0){
    //newTasks.push(new Task_BuildStructure(('c3ce57b592d7b10' as Id<StructureContainer>),temp,3));
  }



  //run all of the workers, removing completed tasks and building active and enqueued task arrays
  runWorkers(currentWorkers,active_tasks,enqueued_tasks);


  //TODO: MAKE WORK FOR CONTAINERS THAT ARE NOT ENERGY
  var containerStates: Array<[Id<StructureContainer>, number, RoomPosition]> = getContainerStates(active_tasks,enqueued_tasks);

  for(let can of containerStates){
    //console.log("container: " + can[0] + "\test: " + can[1] + "\troom: " + can[2].roomName);
  }


  //console.log("container1 est: " + containerStates[0][1] + "\tcontainer2 est: " + containerStates[1][1]);

  //room manager
  for(let name in Game.spawns){
    let spawn = Game.spawns[name];
    let nodes = spawn.room.find(FIND_SOURCES);
    newTasks = newTasks.concat(manageRoomNodes(spawn, nodes, active_tasks));



    newTasks = newTasks.concat(manageBuildTasks         (spawn, active_tasks, enqueued_tasks, containerStates));
    newTasks = newTasks.concat(manageRepairTasks        (spawn, active_tasks, enqueued_tasks));
    newTasks = newTasks.concat(manageRoomEnergy         (spawn, active_tasks, enqueued_tasks, containerStates));
    newTasks = newTasks.concat(manageControllerUpgrades (spawn, containerStates));


    //TODO: DELETE THIS NEX CODE
    const cannon = <StructureTower>(
      spawn.room.find(FIND_MY_STRUCTURES, { filter: struct => struct.structureType === STRUCTURE_TOWER })[0]
    );
    const enemies = spawn.room.find(FIND_HOSTILE_CREEPS);
    if(enemies && spawn.room.controller?.safeModeAvailable){
      spawn.room.controller?.activateSafeMode();
    }
    if (cannon && enemies) {
      cannon.attack(enemies[0]);
    }


  }
  //console.log("num new tasks this tick: " + newTasks.length);
  var unassignedTasks: Array<Task> = assignTasks(newTasks, currentWorkers, active_tasks, enqueued_tasks);

  //request more creeps


  for(let unassignedTask of unassignedTasks){

  }





});
