import { manageRoomNodes } from "ManageRoomNodes";
import { runTask } from "RunTask";
import { Task } from "Task";
import { assignTasks } from "TaskAssigner";
import { createBuildTasks } from "CreateBuildTasks";
import { Task_JetcanMine } from "Task_JetcanMine";
import { findNearestInTime } from "Utilities";
import { ErrorMapper } from "utils/ErrorMapper";
import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";

import {Task_SpawnCreep} from "./Task_SpawnCreep";
import { manageRoomEnergy } from "ManageRoomEnergy";

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


import { Traveler } from "utils/Traveler";

Traveler.init();

export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tic is ${Game.time}`);

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

  //Game.spawns['Spawn1'].memory.type = new WorkerType("small_spawner", ["spawner"], [0,1,0,0,0,0,0,0]);


  for(let name in Game.spawns){
    let spawn = Game.spawns[name];
    currentWorkers.push(spawn);
    if(spawn.memory.tasks?.length > 0){

      if (spawn.memory.tasks[0].status == "COMPLETED"){
        spawn.memory.tasks.shift();
      }
      runTask(spawn,spawn.memory.tasks[0]);
      active_tasks.push([spawn.memory.tasks[0], spawn]);
      spawn.memory.tasks.slice(1).forEach(t => enqueued_tasks.push([t,spawn]));
    }
  }

  for(let name in Game.creeps){
    let creep = Game.creeps[name];
    currentWorkers.push(creep);
    if(creep.memory.tasks?.length > 0){

      if (creep.memory.tasks[0].status == "COMPLETED"){
        creep.memory.tasks.shift();
      }

      runTask(creep, creep.memory.tasks[0]);
      active_tasks.push([creep.memory.tasks[0], creep]);
      creep.memory.tasks.slice(1).forEach(t => enqueued_tasks.push([t,creep]));
    }
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }


  //room manager
  for(let name in Game.spawns){
    let spawn = Game.spawns[name];
    let nodes = spawn.room.find(FIND_SOURCES);
    newTasks = newTasks.concat(manageRoomNodes(spawn, nodes, active_tasks));

    let constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
    newTasks = newTasks.concat(createBuildTasks(constructionSites, active_tasks, enqueued_tasks));

    newTasks = newTasks.concat(manageRoomEnergy(spawn,active_tasks,enqueued_tasks));


  }
  var unassignedTasks: Array<Task> = assignTasks(newTasks, currentWorkers, active_tasks, enqueued_tasks);

  //request more creeps


  for(let unassignedTask of unassignedTasks){

  }

});
