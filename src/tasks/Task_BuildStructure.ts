import { WorkerType } from "WorkerType";
import { WorkerTypes } from "WorkerTypes";
import { Task } from "Task";



export class Task_BuildStructure implements Task {
    name: string;
    status: string;
    taskLocation: RoomPosition;
    taskDestination: RoomPosition;
    priority: number;
    requireResource: boolean;
    isRepeatable: boolean;
    validWorkers: Array<WorkerType>;
    estRemainingTime: number;
    resourceCost:      number;
    isInit:                 boolean;


  //-------------------------------------------

    building:                   boolean;
    sourceID:                   Id<AnyStoreStructure>;
    constructionSiteID:         Id<ConstructionSite>;
    timePassed:                 number;
    bootstrap: boolean;

  constructor(sourceID: Id<AnyStoreStructure>, constructionSite: ConstructionSite, priority: number) {
    this.name = "build_structure";
    this.status = "HALTED";
    this.taskLocation = constructionSite.pos;
    this.taskDestination = constructionSite.pos;
    this.priority = priority;
    this.isRepeatable = true;
    this.requireResource = false;
    this.validWorkers = WorkerTypes.filter(w => w.categories.includes("builder"));
    this.estRemainingTime = (constructionSite.progressTotal/5);                   //really rough estimation

    this.building = false;
    this.sourceID = sourceID;
    this.constructionSiteID = constructionSite.id;
    this.timePassed = 0;
    this.bootstrap = false;
    this.resourceCost = _.min([constructionSite.progressTotal, 500]);
    this.isInit = false;
  }



}

export function runTask_BuildStructure(taskOwner: Creep, task: Task_BuildStructure) {




    //this is utterly fucking retarded
    let maybeSite = Game.getObjectById(task.constructionSiteID);
    if(maybeSite){
        task.resourceCost = maybeSite.progressTotal - maybeSite.progress;
        let dest = new RoomPosition(task.taskLocation.x, task.taskLocation.y, task.taskLocation.roomName);

        if(task.building && taskOwner.store[RESOURCE_ENERGY] == 0){
            task.building = false;
        }
        if(!task.building && taskOwner.store.getFreeCapacity() == 0){
            task.building = true;
        }

        if(task.building){
            if (taskOwner.pos.isNearTo(dest)){
                task.status = "RUNNING";
                let err = taskOwner.build(maybeSite);
                if(err != 0 ){
                    console.log("build err " + err);
                }
            }else{
                if(taskOwner.travelTo(dest) != 0){
                    task.status = "HALTED";
                }else{
                    //console.log("debug");
                    task.status = "RUNNING";
                }
            }
        }else{



            let source = Game.getObjectById(task.sourceID);
            if(source){

                if(!task.isInit){
                    task.estRemainingTime += (PathFinder.search(taskOwner.pos,source.pos).cost);
                    task.isInit = true;
                  }

                let errCode = taskOwner.withdraw(source,RESOURCE_ENERGY);
                if (errCode != ERR_NOT_IN_RANGE){
                    if(errCode != 0 ){
                        if(errCode == -6){
                            //low on energy
                        }else{
                            console.log("build withdraw err " + errCode);
                        }

                    }
                }else{
                    let errCode = taskOwner.travelTo(source.pos);
                    if( errCode != 0){
                        console.log("build travelTo err " + errCode);
                        task.status = "HALTED";
                    }else{
                        //console.log("x: " + source.pos.x + " y: " + source.pos.y);
                        task.status = "RUNNING";
                    }
                }
            }else{
                console.log(taskOwner.name + " failed to find path to source to build " + task.constructionSiteID);
                task.bootstrap = true;
            }
        }



        task.timePassed++;
        let progressPercent = maybeSite.progress/maybeSite.progressTotal
        if (progressPercent > 0.15){
            task.estRemainingTime = (1 - progressPercent) / (progressPercent / task.timePassed);
        }



    }else{
        console.log("Build time estimation error: " + task.estRemainingTime);
        task.status = "COMPLETED";


    }

}
