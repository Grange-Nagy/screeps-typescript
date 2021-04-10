import { SourceNode } from "source-map";
import { Task } from "Task";
import { Task_JetcanMine } from "Task_JetcanMine";



export function manageRoomNodes(spawn: StructureSpawn, nodes: Array<Source>, active_tasks: Array<[Task, (Creep | StructureSpawn)]>):Array<Task>{
    var taskManagerMemory = Game.spawns['Spawn1'].room.memory;
    var newTasks: Array<Task> = [];
    for(let i = 0; i < nodes.length; i++){

        //if node has not been assigned container location in global memory
        if (taskManagerMemory.sourceContainerAssignments.findIndex(e => e[0] == nodes[0].id) == -1){
          //find locations for each container and store them in global memory
          let path = PathFinder.search(nodes[i].pos,spawn.pos);
          let containerLocation = new RoomPosition(path.path[0].x, path.path[0].y, nodes[i].room.name);
          taskManagerMemory.sourceContainerAssignments.push([nodes[0].id,containerLocation]);
        }



        let containerEntry = taskManagerMemory.sourceContainerAssignments.find(e => e[0] == nodes[i].id);
        if(containerEntry){
          let containerPos: RoomPosition = containerEntry[1];
          let isAssigned = false;
          //create jetcan mining tasks
          for(let task of active_tasks){
            if (task[0].taskLocation == undefined){continue;}
            if(task[0].taskLocation.x === containerPos.x && task[0].taskLocation.y === containerPos.y && task[0].taskLocation.roomName === containerPos.roomName && task[0].name === "jetcan_mine"){
              isAssigned = true;
              //console.log("no need for new miner" + JSON.stringify(task));
              break;
            }
          }


          let isContainer = false;
          for(let containerName in Game.structures){
            if (Game.structures[containerName].structureType == STRUCTURE_CONTAINER){
              let container = Game.structures[containerName];
              if (containerPos.isEqualTo(container.pos)){
                isContainer = true;
                break;
              }
            }
          }
          if (!(isAssigned)){

            newTasks.push(new Task_JetcanMine(nodes[i],containerEntry[1]));
          }
          if(!(isContainer)){
            Game.rooms[containerPos.roomName].createConstructionSite(containerPos.x,containerPos.y,STRUCTURE_CONTAINER);
          }
        }

      }
      return newTasks;
}
