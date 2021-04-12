import { Task } from "Task";


export function getContainerStates(active_tasks: Array<[Task, (Creep | StructureSpawn)]>, enqueued_tasks: Array<[Task, (Creep | StructureSpawn)]>): Array<[Id<StructureContainer>, number, RoomPosition]>{

      //TODO: MAKE WORK FOR CONTAINERS THAT ARE NOT ENERGY
  var containerStates: Array<[Id<StructureContainer>, number, RoomPosition]> = [];

  let containers: Array<StructureContainer> = [];
  for(let spawnName in Game.spawns){
    let spawn = Game.spawns[spawnName];
    let roomCans = spawn.room.find(FIND_STRUCTURES, {filter: x => x.structureType == STRUCTURE_CONTAINER});
    containers = containers.concat(roomCans as Array<StructureContainer>);
  }

  for(let can of containers){
    containerStates.push([can.id, can.store.energy, can.pos]);
    if(can.store.energy){
      //console.log("Can full!");
    }
  }

  for(let task of active_tasks){
    if(task[0].resourceCost > 0){
      //find source
      //console.log("debug");
      let stateIndex = containerStates.findIndex(x => x[2].x == task[0].taskLocation.x && x[2].y == task[0].taskLocation.y);
      if(stateIndex != -1){
        containerStates[stateIndex][1] -= task[0].resourceCost;
        //console.log("task[0].resourceCost " + task[0].resourceCost);
      }else{
        //console.log("Container find by index returned " + stateIndex);
      }

    }
  }

  for(let task of enqueued_tasks){
    if(task[0].resourceCost > 0){
      //find source
      let stateIndex = containerStates.findIndex(x => x[2].x == task[0].taskLocation.x && x[2].y == task[0].taskLocation.y);
      if(stateIndex != -1){
        containerStates[stateIndex][1] -= task[0].resourceCost;
        //console.log("Container find by index returned good " + stateIndex);
      }else{
        //console.log("Container find by index returned " + stateIndex);
      }
    }
  }
  //let task_adj_container_cap = (containerStates[0][1] + containerStates[1][1]);
  //console.log("task adjusted container capacity = " + task_adj_container_cap)

  return containerStates;

}
