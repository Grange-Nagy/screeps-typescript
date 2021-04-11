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
import { createRepairTasks } from "ManageRoomRepair";
import { Task_UpgradeController } from "Task_UpgradeController";

Traveler.init();

export const loop = ErrorMapper.wrapLoop(() => {
  //console.log(`Current game tic is ${Game.time}`);

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





  for(let name in Game.spawns){
    let spawn = Game.spawns[name];
    currentWorkers.push(spawn);
    if(spawn.memory.tasks?.length > 0){

      if (spawn.memory.tasks[0].status == "COMPLETED"){
        spawn.memory.tasks.shift();
      }else{
        runTask(spawn,spawn.memory.tasks[0]);
        active_tasks.push([spawn.memory.tasks[0], spawn]);
        spawn.memory.tasks.slice(1).forEach(t => enqueued_tasks.push([t,spawn]));
      }

    }
  }

  for(let name in Game.creeps){
    let creep = Game.creeps[name];
    currentWorkers.push(creep);
    if(creep.memory.tasks?.length > 0){

      if (creep.memory.tasks[0].status == "COMPLETED"){
        creep.memory.tasks.shift();
      }else{
        runTask(creep, creep.memory.tasks[0]);
        active_tasks.push([creep.memory.tasks[0], creep]);
        creep.memory.tasks.slice(1).forEach(t => enqueued_tasks.push([t,creep]));
      }


    }
  }


  //TODO: MAKE WORK FOR CONTAINERS THAT ARE NOT ENERGY
  var containerStates: Array<[Id<StructureContainer>, number, RoomPosition]> = [];
  let containers: Array<StructureContainer> = [];
  for(let spawnName in Game.spawns){
    let spawn = Game.spawns[spawnName];
    let roomCans = spawn.room.find(FIND_STRUCTURES, {filter: x => x.structureType == STRUCTURE_CONTAINER});
    containers = containers.concat(roomCans as Array<StructureContainer>);
  }

  for(let can of containers){
    containerStates.push([can.id, can.store.energy, can.pos]);
  }

  //console.log("before: " +containerStates[0][1]);
  for(let task of active_tasks){
    if(task[0].resourceCost > 0){
      //find source
      //console.log("debug");
      let stateIndex = containerStates.findIndex(x => x[2].x == task[0].taskLocation.x && x[2].y == task[0].taskLocation.y);
      if(stateIndex != -1){
        containerStates[stateIndex][1] -= task[0].resourceCost;
        //console.log("task[0].resourceCost " + task[0].resourceCost);
      }else{
        //console.log("Container find by index returned " + stateIndex);
      }

    }
  }
  //console.log("after: " +containerStates[0][1]);
  for(let task of enqueued_tasks){
    if(task[0].resourceCost > 0){
      //find source
      let stateIndex = containerStates.findIndex(x => x[2].x == task[0].taskLocation.x && x[2].y == task[0].taskLocation.y);
      if(stateIndex != -1){
        containerStates[stateIndex][1] -= task[0].resourceCost;
        //console.log("Container find by index returned good " + stateIndex);
      }else{
        //console.log("Container find by index returned " + stateIndex);
      }
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
    newTasks = newTasks.concat(createRepairTasks(spawn,active_tasks,enqueued_tasks));
    newTasks = newTasks.concat(manageRoomEnergy(spawn,active_tasks,enqueued_tasks));



    if(spawn.room.energyAvailable / spawn.room.energyCapacityAvailable > 0.5){
      let cans=spawn.room.find(FIND_STRUCTURES).filter(struct => struct.structureType == STRUCTURE_CONTAINER);
                 //reduce((a,b) => (a as StructureContainer).store.energy > (b as StructureContainer).store.energy ? a : b);


      let maxCan = cans[0].id as Id<StructureContainer>;
      let maxCanVal = 0;
      for(let can of cans){
        let tmp = containerStates.find(x => x[0] == can.id);
        if(tmp){
          let tmpVal = tmp[1];
          if(tmp && tmpVal >= maxCanVal){
            maxCan = containerStates.find(x => x[0] == can.id)?.[0] as Id<StructureContainer>;
            maxCanVal = tmpVal;
          }
        }

      }
      let sumCan = 0;
      spawn.room.find(FIND_STRUCTURES).filter(struct => struct.structureType == STRUCTURE_CONTAINER).
                 forEach(x => sumCan += (x as StructureContainer).store.energy);

      //console.log("sumcan = " + sumCan);
      if(spawn.room.controller && sumCan > cans.length*1000){
        newTasks.push(new Task_UpgradeController(maxCan,spawn.room.controller?.id,1));
      }

    }


  }
  //console.log("num new tasks this tick: " + newTasks.length);
  var unassignedTasks: Array<Task> = assignTasks(newTasks, currentWorkers, active_tasks, enqueued_tasks);

  //request more creeps


  for(let unassignedTask of unassignedTasks){

  }

});
