import { Task } from "Task";
import { Task_UpgradeController } from "tasks/Task_UpgradeController";


export function manageControllerUpgrades(spawn: StructureSpawn, containerStates: Array<[Id<StructureContainer>, number, RoomPosition]>): Array<Task>{

    let newTasks: Array<Task> = [];

    let roomContainers: Array<[Id<StructureContainer>, number, RoomPosition]> = [containerStates[0]];
    roomContainers = containerStates.filter(ele => ele[2].roomName == spawn.room.name);

    if(roomContainers != [] && roomContainers && roomContainers != null && roomContainers.length != 0){
        //console.log(spawn.name);
        let maxRoomContaineramm = roomContainers.reduce((a,b) => (a[1] > b[1]) ? a : b)[1];
        if(maxRoomContaineramm > 750){
            let maxRoomContainerID = roomContainers.reduce((a,b) => (a[1] > b[1]) ? a : b)[0];
            if (spawn.room.controller){
                newTasks.push(new Task_UpgradeController(maxRoomContainerID, spawn.room.controller.id,2));
            }
        }
    }


    return newTasks;
}
