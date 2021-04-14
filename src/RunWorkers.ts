import { runTask } from "RunTask";
import { Task } from "Task";
import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";



export function runWorkers(currentWorkers: Array<Creep | StructureSpawn>, active_tasks: Array<[Task, (Creep | StructureSpawn)]>, enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>){
    for(let name in Game.spawns){
      let spawn = Game.spawns[name];
      spawn.memory.type = WorkerTypes[0];

       //TODO remove
       if (!spawn.memory.tasks || !spawn.memory.type){
        //spawn.memory.type = WorkerTypes[1];
        spawn.memory.tasks = [];
        //spawn.memory.role = null;
      }

      currentWorkers.push(spawn);
      if(spawn.memory.tasks?.length > 0){

        for(let i = 1; i < spawn.memory.tasks.length; i++){

          if(spawn.memory.tasks[i].maxQueueableDepth < i){
            spawn.memory.tasks.splice(i,1);
          }

        }

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

      //TODO remove
      if (creep.memory.role || !creep.memory.tasks){
        //creep.memory.type = WorkerTypes[1];
        creep.memory.tasks = [];
        creep.memory.role = null;
      }


      currentWorkers.push(creep);
      if(creep.memory.tasks?.length > 0){

        for(let i = 1; i < creep.memory.tasks.length; i++){

          if(creep.memory.tasks[i].maxQueueableDepth < i){
            creep.memory.tasks.splice(i,1);
          }

        }


        if (creep.memory.tasks[0].status == "COMPLETED"){
          creep.memory.tasks.shift();
        }else{
          runTask(creep, creep.memory.tasks[0]);
          active_tasks.push([creep.memory.tasks[0], creep]);
          creep.memory.tasks.slice(1).forEach(t => enqueued_tasks.push([t,creep]));
        }


      }
    }
  }
