import { Task } from "Task";


export class Solution{

    workerTasks: Array<[StructureSpawn | Creep, Array<Task>]>;
    worstCost: number;

    constructor(workerTasks: Array<[StructureSpawn | Creep, Array<Task>]>){

        this.workerTasks = workerTasks;
        this.worstCost = 0;

        for(let worker of workerTasks){

            //if there are no tasks assigned to this worker
            if(worker[1] == []){
                continue;
            }
            let infiniteTask = false;

            for(let i = 0; i < worker[1].length; i++){
                if(worker[1][i].estRemainingTime > 9999999){
                    infiniteTask = true;
                  break;
                }
                if(potentialWorker.memory.tasks[i].priority != 0){
                  if(i == 0){
                      estTimeUntilFree = potentialWorker.memory.tasks[i].estRemainingTime;
                    }else{
                      let pathBetween = PathFinder.search(potentialWorker.memory.tasks[i - 1].taskDestination, potentialWorker.memory.tasks[i].taskLocation);
                      //console.log("pathBetween.cost = " + pathBetween.cost);
                      //console.log("pathBetween.adj = " + logCostAdj(pathBetween.cost));
                      estTimeUntilFree += (pathBetween.cost * potentialWorker.memory.type.unburdened_speed) + potentialWorker.memory.tasks[i].estRemainingTime;
                      //console.log("potentialWorker.memory.tasks?.length: " + potentialWorker.memory.tasks?.length + ", est time free: " + estTimeUntilFree);
                    }
                }

              }
              if(infiniteTask){
                  continue;
              }





        }


    }

}
