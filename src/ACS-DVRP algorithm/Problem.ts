import { Task } from "Task";



export class Problem{
    //array of tuples containing workers and an array of tuples with the workers explored edges and number of times explored
    workerStates: Array<[StructureSpawn | Creep, Array<[[RoomPosition, RoomPosition], number]>]>;
    tasks: Array<Task>;


    constructor(pendOrds: Array<Task>, currentWorkers: Array<Creep | StructureSpawn>){
        this.tasks = pendOrds;
        this.workerStates = currentWorkers.map(x => [x, []]);
    }




}
