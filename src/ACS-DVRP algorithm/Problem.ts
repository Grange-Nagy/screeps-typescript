import { Task } from "Task";
import { Cache } from "./Cache";


//TODO: replace all of these fucked tuple arrays with proper data types
export class Problem{

    //array of tuples containing workers and an array of tuples with the workers explored edges and number of times explored
    workerStates: Array<[StructureSpawn | Creep, Array<[[RoomPosition, RoomPosition], number]>]>;
    tasks: Array<Task>;
    //the cost, then an array of workers and their tasks
    bestSolution: [number, Array<[StructureSpawn | Creep, Array<Task>]>];


    constructor(pendOrds: Array<Task>, currentWorkers: Array<Creep | StructureSpawn>){
        this.tasks = pendOrds;
        this.workerStates = currentWorkers.map(x => [x, []]);
        this.bestSolution = [9999999, []];
    }


    public runACS(cache: Cache) {

        let taskCopy = this.tasks;
        //this populates currentSolution with worker positions and the running sum of costs
        let currentSolution: [number, Array<[StructureSpawn | Creep, RoomPosition, number, Array<Task>]>] = [0, this.workerStates.map(x => [x[0],x[0].pos,9999999,[]])];


        while(taskCopy.length != 0){
            //array [worker, task, probability of selected task, totalCost]
            let currentIteration: Array<[StructureSpawn | Creep, Task | undefined, number, number,[RoomPosition, RoomPosition]]> = [];
            //have each worker select their next task stored in currentIteration using ACS probability

            for(let i = 0; i < this.workerStates.length; i++){
                let taskWeights: Array<number> = [];
                let taskCosts: Array<number> = [];
                let taskEdges = [];
                for(let task of taskCopy){
                    //check if worker is valid for task
                    if(task.validWorkers.findIndex(x => x.name == this.workerStates[i][0].memory.type.name) == -1){
                        continue;
                    }

                    //query cache based on edge
                    let cacheTuple = cache.getTuple(currentSolution[1][i][1], task.taskLocation);
                    let recency = this.workerStates[i][1].find(x => x[0] == [currentSolution[1][i][1], task.taskLocation])?.[1];
                    if (!recency){
                        recency = 0;
                    }
                    //TODO: tweak the weightings (include task prio?)
                    taskWeights.push((cacheTuple[1] - recency + 10) / cacheTuple[0]);
                    taskCosts.push(cacheTuple[0]);
                    taskEdges.push([currentSolution[1][i][1], task.taskLocation]);
                }
                //select task index based on probability
                if(taskWeights.length == 0){
                    continue;
                }
                let sumWeights = taskWeights.reduce((a,b) => a + b,0);
                let normalizedWeights = taskWeights.map(x => x/sumWeights);
                let runningSum = 0;
                let rand = Math.random();
                let selectedIndex;
                for(selectedIndex = 0; selectedIndex < normalizedWeights.length; selectedIndex++){
                    runningSum += normalizedWeights[selectedIndex];
                    if(runningSum > rand){
                        break;
                    }
                }
                //console.log("i: " + selectedIndex + ", w: " + JSON.stringify(taskWeights));
                if((taskCopy[selectedIndex]) == undefined){
                    continue;
                }


                currentIteration.push([this.workerStates[i][0], taskCopy[selectedIndex], taskWeights[selectedIndex], taskCosts[selectedIndex], [currentSolution[1][i][1], taskCopy[selectedIndex].taskLocation]]);
                if(taskCopy.length == 1){
                    taskCopy = [];
                }
                taskCopy.splice(selectedIndex,1);
            }


            //resolve conflict on doubly selected tasks with ACS probability stored in currentIteration
            for(let i = 0; i < currentIteration.length; i++){
                //get indexes of conflicts
                var indexes:Array<number> = [];
                var conflictWeights = [];
                for(let j = i+1; j < currentIteration.length; j++){
                    if(currentIteration[i][1] == currentIteration[j][1]){
                        indexes.push(j);
                        //TODO: tweak distance weighting for resolving conflicts
                        conflictWeights.push(currentIteration[j][2] / currentSolution[1][j][2]);
                    }
                }
                //select task index based on probability
                if(conflictWeights.length == 0){
                    continue;
                }
                let sumWeights = conflictWeights.reduce((a,b) => a + b,0);
                let normalizedWeights = conflictWeights.map(x => x/sumWeights);
                let runningSum = 0;
                let rand = Math.random();
                let selectedIndex;
                for(selectedIndex = 0; selectedIndex < normalizedWeights.length; selectedIndex++){
                    runningSum += normalizedWeights[selectedIndex];
                    if(runningSum > rand){
                        break;
                    }
                }
                //remove losers
                for(let index of indexes){
                    if(index == selectedIndex){
                        continue;
                    }
                    currentIteration[index][1] = undefined;
                }

            }

            //populate current solution
            for(let i = 0; i < currentSolution[1].length; i++){
                //check if worker has new task
                if(currentIteration[i] == undefined || currentIteration[i][1] == undefined){
                    continue;
                }

                currentSolution[1][i][1] = (currentIteration[i][1]?.taskLocation as RoomPosition);
                currentSolution[1][i][2] = (currentIteration[i][1]?.estRemainingTime as number) + currentIteration[i][3];
                currentSolution[1][i][3].push(currentIteration[i][1] as Task);


                //console.log("populating a solution: " + currentSolution[1][i][2] + " > " + currentSolution[0]);
                if(currentSolution[1][i][2] > currentSolution[0]){
                    currentSolution[0] = currentSolution[1][i][2];
                }

                let findIndex = this.workerStates[i][1].findIndex(x => x[0] == currentIteration[i][4]);
                if(findIndex == -1){
                    //add aedge
                    this.workerStates[i][1].push([currentIteration[i][4], 1]);
                }else{
                    //increment edge
                    this.workerStates[i][1][findIndex][1]++;
                }

            }


        }

        if(currentSolution[0] < this.bestSolution[0]){
            this.bestSolution = [currentSolution[0], currentSolution[1].map(x => [x[0], x[3]])];
        }



    }

    public commit(Tac: number){

        for(let worker of this.bestSolution[1]){

            if(worker[1].length == 0){
                continue;
            }

            //if worker is idle
            if(worker[0].memory.tasks.length == 0){
                worker[0].memory.tasks.push(worker[1][0]);

            //if worker has one remaining task that is est completed in under the advanced commitment time
            }else if(worker[0].memory.tasks.length == 1 && worker[0].memory.tasks[0].estRemainingTime < Tac){
                worker[0].memory.tasks.push(worker[1][0]);
            }
        }

    }




}
