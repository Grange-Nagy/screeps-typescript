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
        let isAssigned = false;
        if(containerEntry){
          for(let task of active_tasks){
            if (task[0] == undefined){continue;}
            if(task[0].name == "jetcan_mine" && (task[0] as Task_JetcanMine).taskLocation.x == containerEntry[1].x && (task[0] as Task_JetcanMine).taskLocation.y == containerEntry[1].y){
              isAssigned = true;
              //console.log("debug");
              break;

            }
          }
        }else{
          continue;
        }



          var container:unknown = null;
          let isContainer = false;
          for(let containerName in Game.structures){
            if (Game.structures[containerName].structureType == STRUCTURE_CONTAINER){
              //console.log("debug");
              container = Game.structures[containerName];
              if (containerEntry[1].isEqualTo((container as StructureContainer).pos)){
                isContainer = true;
                break;
              }
            }
          }

          let containersInRoom: Array<StructureContainer>  = (spawn.room.find(FIND_STRUCTURES).filter(
            struct => (struct.structureType == STRUCTURE_CONTAINER))) as Array<StructureContainer>;


          //console.log("debug1");
          if (!(isAssigned)){
            //console.log("debug2");
            for(let can of containersInRoom){
              //console.log(can.pos.x + ", " + can.pos.y + " vs " +  + ", " + containerEntry[1].y);
              if(can.pos.x == containerEntry[1].x && can.pos.y == containerEntry[1].y){
                console.log("creating jectcan task");
                newTasks.push(new Task_JetcanMine(nodes[i],containerEntry[1], can));
              }
            }

          }
          if(!(isContainer)){
            Game.rooms[containerEntry[1].roomName].createConstructionSite(containerEntry[1].x,containerEntry[1].y,STRUCTURE_CONTAINER);
          }
        }

      return newTasks;
}
