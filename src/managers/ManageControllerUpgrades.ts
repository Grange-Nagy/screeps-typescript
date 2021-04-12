import { Task } from "Task";
import { Task_UpgradeController } from "tasks/Task_UpgradeController";


export function manageControllerUpgrades(spawn: StructureSpawn, containerStates: Array<[Id<StructureContainer>, number, RoomPosition]>): Array<Task>{

    let newTasks: Array<Task> = [];

    let roomContainers = containerStates.filter(ele => ele[2].roomName == spawn.room.name);
    let containersInRoomRAW: Array<StructureContainer>  = (spawn.room.find(FIND_STRUCTURES).filter(
        struct => (struct.structureType == STRUCTURE_CONTAINER))) as Array<StructureContainer>;

    let maxRoomContaineramm = roomContainers.reduce((a,b) => (a[1] > b[1]) ? a : b)[1];
    if(maxRoomContaineramm > 1000){
        let maxRoomContainerID = roomContainers.reduce((a,b) => (a[1] > b[1]) ? a : b)[0];
        if (spawn.room.controller){
            newTasks.push(new Task_UpgradeController(maxRoomContainerID, spawn.room.controller.id,2));
        }
    }else if(containersInRoomRAW.reduce((a,b) => (a.store.energy > b.store.energy) ? a : b).store.energy == 2000 && Game.time % 10 == 0){
        if (spawn.room.controller){
            newTasks.push(new Task_UpgradeController(containersInRoomRAW.reduce((a,b) => (a.store.energy > b.store.energy) ? a : b).id, spawn.room.controller.id,2));
        }

    }

    return newTasks;
}
