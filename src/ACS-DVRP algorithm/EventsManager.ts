import { Task } from "Task";

const Tco = 123;    //cutoff time
const Tac = 123;    //advanced commitment time
const T = 123;      //working day
const n_ts = 123;   //number of time slices
const T_ts = 123;


//https://doc.rero.ch/record/312554/files/10878_2005_Article_4922.pdf
export function eventsManager(preOrds: Array<Task>){

    var time = 0
    var pendOrds: Array<Task> = preOrds;
    //get each worker location
    var staticProb;
    var commOrds: Array<Task>;

    while(pendOrds.length != 0 || time < Tco){

        if(time > 0){
            staticProb = buildProblem(pendOrds, time + Tac);
        }else{
            staticProb = buildProblem(pendOrds, time);
        }

        runACS(staticProb);

        commOrds = getOrders(staticProb, time + (T/n_ts) + Tac)

        commitOrders(commOrds);

        pendOrds = pendOrds.filter(x => !commOrds.includes(x));

        pendOrds.concat(newOrders);

        time += T_ts;

        //update starting positions
        //update pheromone matrix


    }


}

