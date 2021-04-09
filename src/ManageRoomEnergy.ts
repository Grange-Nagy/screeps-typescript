import { SourceNode } from "source-map";
import { Task } from "Task";
import { Task_JetcanMine } from "Task_JetcanMine";
import { Task_MoveItem } from "Task_MoveItem";

var taskManagerMemory = Game.spawns['Spawn1'].room.memory;

export function manageRoomEnergy(spawn: StructureSpawn, active_tasks: Array<[Task, (Creep | StructureSpawn)]>,
                                                        enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>):Array<Task>{
    let newTasks: Array<Task> = [];

    //if all energy is in storage
    if(spawn.room.energyCapacityAvailable = spawn.room.energyAvailable){
        return [];
    }

    let containers: Array<StructureContainer> = [];
    //calculate energy in each container accounting for current tasks
    for(let containerName in Game.structures){
        if (spawn.room.find(FIND_STRUCTURES).filter(struct => taskManagerMemory.sourceContainerAssignments.findIndex(ele => ele[1] == struct.pos) != -1)){
            let container = Game.structures[containerName] as StructureContainer;
            var currentEnergy = container.store.energy;
            for (let task of active_tasks){
                if(task[0].name == "move_item"){
                    let moveTask = task[0] as Task_MoveItem;
                }
            }
        }

    }

    return newTasks;
}
