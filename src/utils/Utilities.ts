

export function findNearestInTime(start: RoomPosition, goals: Array<Creep | StructureSpawn>): [(Creep | StructureSpawn), number]{

    let winner: [(Creep | StructureSpawn), number] = [goals[0], 99999999999];
    for(let goal of goals){
        let path = PathFinder.search(start, goal.pos);
        if(path.cost / goal.memory.type.unburdened_speed < winner[1]){
          winner[0] = goal;
          winner[1] = logCostAdj(path.cost) / goal.memory.type.unburdened_speed;
        }
      }
      return winner;

}

export function logCostAdj(x: number):number{

  const a = 4;
  const c = 44;
  const k = 0.2;

  return x * (1 + (a / (1 + Math.exp(-k * (x - c)))));

}



