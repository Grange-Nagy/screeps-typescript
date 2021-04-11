import { Task } from "Task";
import { runTask_BuildStructure, Task_BuildStructure } from "Task_BuildStructure";
import { runTask_JetcanMine, Task_JetcanMine } from "Task_JetcanMine";
import { runTask_MoveItem, Task_MoveItem } from "Task_MoveItem";
import { runTask_RepairStructure, Task_RepairStructure } from "Task_RepairStructure";
import { runTask_SpawnCreep, Task_SpawnCreep } from "Task_SpawnCreep";
import { runTask_UpgradeController, Task_UpgradeController } from "Task_UpgradeController";

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

        case("build_structure"):{
            let task = undefTask as Task_BuildStructure;
            if (undefTaskOwner instanceof Creep){
                let taskOwner: Creep = undefTaskOwner;
                runTask_BuildStructure(taskOwner,task);
            }
            return 0;
        }

        case("repair_structure"):{
            let task = undefTask as Task_RepairStructure;
            if (undefTaskOwner instanceof Creep){
                let taskOwner: Creep = undefTaskOwner;
                runTask_RepairStructure(taskOwner,task);
            }
            return 0;
        }

        case("move_item"):{
            let task = undefTask as Task_MoveItem;
            if (undefTaskOwner instanceof Creep){
                let taskOwner: Creep = undefTaskOwner;
                runTask_MoveItem(taskOwner,task);
            }
            return 0;
        }
        case("upgrade_controller"):{
            let task = undefTask as Task_UpgradeController;
            if (undefTaskOwner instanceof Creep){
                let taskOwner: Creep = undefTaskOwner;
                runTask_UpgradeController(taskOwner,task);
            }
            return 0;
        }








        default:
            //failed to find task run
            console.log("Failed to find runTask for: " + undefTask.name);
            return -1;

    }







}


