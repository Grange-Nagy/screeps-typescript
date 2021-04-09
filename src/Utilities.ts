

export function findNearestInTime(start: RoomPosition, goals: Array<Creep | StructureSpawn>): [(Creep | StructureSpawn), number]{

    let winner: [(Creep | StructureSpawn), number] = [goals[0], 99999999999];
    for(let goal of goals){
        let path = PathFinder.search(start, goal.pos);
        if(path.cost / goal.memory.type.unburdened_speed < winner[1]){
          winner[0] = goal;
          winner[1] = path.cost / goal.memory.type.unburdened_speed;
        }
      }
      return winner;

}
