

export interface WorkerState{

    //Array<[StructureSpawn | Creep, Array<[[RoomPosition, RoomPosition], number]>]>;
    worker: StructureSpawn | Creep;
    edgesVisited: Array<[[RoomPosition, RoomPosition], number]>;



}
