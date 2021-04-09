import { Task } from "Task";
import { runTask_JetcanMine, Task_JetcanMine } from "Task_JetcanMine";
import { runTask_SpawnCreep, Task_SpawnCreep } from "Task_SpawnCreep";

export function runTask(undefTaskOwner: AnyCreep | AnyStructure, undefTask: Task){

    if(undefTask == undefined){
        return -1;
    }

    switch(undefTask.name){

        case("spawn_creep"):{
            let task = undefTask as Task_SpawnCreep;
            if (undefTaskOwner instanceof StructureSpawn){
                let taskOwner: StructureSpawn = undefTaskOwner;
                //let task: Task_SpawnCreep = undefTask;

                runTask_SpawnCreep(taskOwner,task);
            }else{
                console.log("something has gone horribly wrong");
            }
            return 0;
        }


        case("jetcan_mine"):{
            let task = undefTask as Task_JetcanMine;
            if (undefTaskOwner instanceof Creep){
                let taskOwner: Creep = undefTaskOwner;
                runTask_JetcanMine(taskOwner,task);
            }
            return 0;
        }







        default:
            //failed to find task run
            console.log("Failed to find runTask for: " + undefTask.name);
            return -1;

    }







}


