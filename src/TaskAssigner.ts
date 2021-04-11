import { Task } from "Task";
import { Task_SpawnCreep } from "tasks/Task_SpawnCreep";
import { findNearestInTime } from "utils/Utilities";


export function assignTasks(newTasks: Array<Task>, currentWorkers: Array<Creep | StructureSpawn>,
                            active_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                            enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>): Array<Task>{
    var unassignedTasks: Array<Task> = [];

    newTasks.sort(((a: Task, b: Task) => a.priority > b.priority ? -1 : 1));
    for(let task of newTasks){
    //checks valid worker types in specified ordering
      //console.log("Task: " + task.name);
      var isAssigned = false;


        for(let valWorker of task.validWorkers){
          let avaliableValidWorkers: Array<Creep | StructureSpawn> = []

          for (let workman of currentWorkers){
            if (workman.memory.type == undefined){
              continue;
            }else{
              if (valWorker.name == workman.memory.type.name){
                  if(workman.memory.tasks.length && workman.memory.tasks.length > 10){
                    continue;
                  }
                avaliableValidWorkers.push(workman);
              }
            }

          }
          //console.log("worker avail on task " + task.name + JSON.stringify(avaliableValidWorkers));

          if(avaliableValidWorkers === undefined || avaliableValidWorkers.length == 0){
            //handle lack of workers
            //console.log("No avaliable worker of type: " + valWorker.name + " for task: " + task.name);
            continue;
          }

          let prio = task.priority;
          if (prio == 0){
              prio = 1;
          }

          switch(prio){
            //at 4, find nearest worker and prepend to all current tasks (also needs to drop items maybe)
            case(4):{
              //console.log("???");
              let winner: [(Creep | StructureSpawn), number] = findNearestInTime(task.taskLocation, avaliableValidWorkers);

              //TODO call interupt function on active task here
              winner[0].memory.tasks.unshift(task);
              active_tasks.push([task,winner[0]]);
              isAssigned = true;
              break;
            }
            //at 3, find nearest worker (in time) inserting after current if not idle
            case(3):{

              let winner: [(Creep | StructureSpawn), number] = [avaliableValidWorkers[0], 99999999999];
              //console.log("switch 2");

              for(let potentialWorker of avaliableValidWorkers){
                let path = PathFinder.search(potentialWorker.pos, task.taskLocation);
                let estTimeUntilFree = 0
                if(potentialWorker.memory.tasks?.length > 0){
                  if(potentialWorker.memory.tasks[0].priority != 0){
                    estTimeUntilFree = potentialWorker.memory.tasks[0].estRemainingTime;
                    if(estTimeUntilFree == -1){
                      estTimeUntilFree = 999999999;
                    }
                  }
                }
                let totalCost = (path.cost * potentialWorker.memory.type.unburdened_speed) + estTimeUntilFree;
                let time_to_live = 0;
                if(potentialWorker instanceof Creep && task.estRemainingTime < 99999){
                  if(potentialWorker.ticksToLive){
                    time_to_live = potentialWorker.ticksToLive;
                  }else{time_to_live = 0;}
                }else{time_to_live = 99999999999;}

                //console.log("total cost: " + totalCost + ", winner[1]: " + winner[1] + ", totalCost + task.estRemainingTime: " + (totalCost + task.estRemainingTime) + ", time to live: " + time_to_live);
                if(totalCost <= winner[1] && totalCost + task.estRemainingTime < time_to_live){
                  winner[0] = potentialWorker;
                  winner[1] = totalCost;
                }
              }

              //if worker not free

              if(winner[1] > 99999){
                continue;
              }
              //console.log("WINNER cost: " + winner[1]);

              if(winner[0].memory.tasks?.length > 0){
                if(winner[0].memory.tasks[0].priority == 0){
                    //TODO call interupt function on active task here
                    winner[0].memory.tasks.unshift(task);
                    active_tasks.push([task,winner[0]]);
                    isAssigned = true;
                    break;
                }
                winner[0].memory.tasks.splice(1,0,task);
                enqueued_tasks.push([task,winner[0]]);
                isAssigned = true;
                break;
              }else{
                winner[0].memory.tasks.push(task);
                active_tasks.push([task,winner[0]]);
                isAssigned = true;
              }
              break;

            }
            //at 2, find nearest worker (in time) appending to takslist if not idle
            case(2):{
              //console.log("???");
              //console.log(JSON.stringify(task));
              //console.log("debug " + task.taskDestination.x);
              let winner: [(Creep | StructureSpawn), number] = [avaliableValidWorkers[0], 99999999999];

              for(let potentialWorker of avaliableValidWorkers){
                let path = PathFinder.search(potentialWorker.pos, task.taskLocation);
                let estTimeUntilFree = 0
                //console.log("debug2 " + potentialWorker.memory.tasks?.length);
                for(let i = 0; i < potentialWorker.memory.tasks?.length; i++){
                  if(potentialWorker.memory.tasks[i].estRemainingTime > 9999999){
                    estTimeUntilFree = 99999999;

                    break;
                  }
                  if(potentialWorker.memory.tasks[i].priority != 0){
                    if(i == 0){
                        estTimeUntilFree = potentialWorker.memory.tasks[i].estRemainingTime;
                      }else{
                        let pathBetween = PathFinder.search(potentialWorker.memory.tasks[i - 1].taskDestination, potentialWorker.memory.tasks[i].taskLocation);
                        estTimeUntilFree += (pathBetween.cost * potentialWorker.memory.type.unburdened_speed) + potentialWorker.memory.tasks[i].estRemainingTime;
                      }
                  }

                }

///////////////////////////////////////////////////////
                let time_to_live = 0;
                if(potentialWorker instanceof Creep  && task.estRemainingTime < 99999){
                  if(potentialWorker.ticksToLive){

                    time_to_live = potentialWorker.ticksToLive;
                  }else{time_to_live = 0;}
                }else{time_to_live = 9999999999;}

                let totalCost = (path.cost * potentialWorker.memory.type.unburdened_speed) + estTimeUntilFree;
                //console.log("total cost: " + totalCost + ", winner[1]: " + winner[1] + ", totalCost + task.estRemainingTime: " + (totalCost + task.estRemainingTime) + ", time to live: " + time_to_live);
                if(totalCost <= winner[1] && totalCost + task.estRemainingTime < time_to_live){
                  winner[0] = potentialWorker;
                  winner[1] = totalCost;
                  //console.log("Winner found in task " + task.name);
                }else{

                }
              }
              //////////////////////////////////////////

              if(winner[1] > 99999){
                continue;
              }
              //console.log("WINNER cost: " + winner[1]);

              if(winner[0].memory.tasks?.length > 0){
                let zeroIndex = winner[0].memory.tasks.findIndex(ele => ele.priority == 0);
                if (zeroIndex != -1){
                    if (zeroIndex == 0){
                        //TODO call interupt function on active task here
                        active_tasks.push([task,winner[0]]);
                    }else{
                        enqueued_tasks.push([task,winner[0]]);
                    }
                    isAssigned = true;
                    winner[0].memory.tasks.splice(zeroIndex,0,task);
                    break;
                }
                winner[0].memory.tasks.push(task);
                enqueued_tasks.push([task,winner[0]]);
                isAssigned = true;
              }else{
                winner[0].memory.tasks.push(task);
                active_tasks.push([task,winner[0]]);
                isAssigned = true;
                break;
              }
              break;
            }
            //at 1, only use idle workers
            //at 0, only use idle workers, allow task to be pushed back by other tasks as if worker was idle
            case(1):{
              //console.log("Switch 1");
              let idleValidWorkers = avaliableValidWorkers.filter(ele => ele.memory.tasks == undefined || ele.memory.tasks.length == 0);
              if (idleValidWorkers === undefined || idleValidWorkers.length == 0){
                continue;
              }
              //console.log("IDLE WORKERS: " + JSON.stringify(idleValidWorkers));
              let winner: [(Creep | StructureSpawn), number] = findNearestInTime(task.taskLocation, idleValidWorkers);
              winner[0].memory.tasks.push(task);
              active_tasks.push([task,winner[0]]);
              isAssigned = true;
              break;
            }

            default:{
              console.log("Task: " + task + " has undefined prio");
            }
          }
          if(isAssigned){
            //console.log("WORKER FOUND FOR " + task.name);
            break;
          }

        }
        //task failed to get assigned
        unassignedTasks.push(task);
        if(task.priority != 0 && !isAssigned){
            for (var valType of task.validWorkers){
                if(!(valType.categories.includes("spawner")) && Game.rooms[task.taskLocation.roomName].energyAvailable > valType.cost){
                    if(valType.name == "small_spawner") {break;}
                    //console.log("room energy " + Game.rooms[task.taskLocation.roomName].energyAvailable + ", crep cost: " + valType.cost);
                    //console.log("attempting to spin up a " + valType.name + "because failed to find worker for:= " + JSON.stringify(task));
                    newTasks.push(new Task_SpawnCreep(task.taskLocation,1,false,valType));
                    break;
                }
            }
        }


      }
      return unassignedTasks;
}
