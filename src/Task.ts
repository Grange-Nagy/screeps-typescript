import { Position } from "source-map";
import { WorkerType } from "WorkerType";



export interface Task{
    name:               string;     //name of task
    status:             string;     //{ENQUEUED, RUNNING,HALTING,COMPLETED}
    taskLocation:       RoomPosition;   //needs to be set on a per task basis (i.e where the creep is desired, null for location agnostic)
    taskDestination:    RoomPosition;   //where workers should be at end of task
    priority:           number;     //at 4, find nearest worker and kick off all current tasks (also needs to drop items maybe)
                                        //at 3, find nearest worker and insert task behind current
                                        //at 2, allow tasks to be rearranged among other prio 3 tasks to optimize pathing
                                        //at 1, only use idle workers
                                        //at 0, only use idle workers, allow task to be pushed back by other tasks as if worker was idle

    requireResource:    boolean;            //if task manager can
    isRepeatable:       boolean;            //if task is a series of tasks bundled together
    validWorkers:       Array<WorkerType>;  //list of valid worker types for this task, in descending order of priority {mostDesired, ... , leastDesired}
    subtasks?:          Array<Task>;        //list of tasks (maybe think about preventing recursion here by making sure isTaskComposition is false for all subtasks), priority should be the same for all subtasks
    estRemainingTime:  number;             //estimated duration of task remaining, initalized as time from
    resourceCost:      number;              //ammount of resources used by task
    maxQueueableDepth: number;

    isInit:                 boolean;

    //interrupt?(taskOwner: AnyCreep | AnyStructure):       void;               //handler to interrupt, check if exists with if(task.interrupt){task.interrupt();}else{what happens if something can't be interrupt}
    //run(taskOwner: AnyCreep | AnyStructure):   void;

}

