import * as _ from "lodash";

const part_costs = [100,50,50,80,150,250,600,10];
const part_names: Array<BodyPartConstant> = ["work","move","carry","attack","ranged_attack","heal","claim","tough"]


export class WorkerType{
    name:               string;
    categories:         Array<string>;
    WORK:               number;
    MOVE:               number;
    CARRY:              number;
    ATTACK:             number;
    RANGED_ATTACK:      number;
    HEAL:               number;
    CLAIM:              number;
    TOUGH:              number;
    stringRep:          Array<BodyPartConstant>;
    partSum:            number;
    cost:               number;
    burdened_speed:     number;
    unburdened_speed:   number;


    constructor(
        name:               string,
        categories:         Array<string>,
        bodyStrucArray:     Array<number>){

        this.name=               name;
        this.categories=         categories;
        this.WORK=               bodyStrucArray[0];
        this.MOVE=               bodyStrucArray[1];
        this.CARRY=              bodyStrucArray[2];
        this.ATTACK=             bodyStrucArray[3];
        this.RANGED_ATTACK=      bodyStrucArray[4];
        this.HEAL=               bodyStrucArray[5];
        this.CLAIM=              bodyStrucArray[6];
        this.TOUGH=              bodyStrucArray[7];

        this.stringRep = [];
        this.cost = 0;
        for(let i = 0; i < bodyStrucArray.length; i++){
            if(bodyStrucArray[i] != 0){
                for(let j = 0; j < bodyStrucArray[i]; j++){
                    this.stringRep.push(part_names[i]);
                }
                this.cost += bodyStrucArray[i] * part_costs[i];
            }
        }



        var partSum = bodyStrucArray.reduce(function(a,b){
            return a+b;
        }, 0);

        this.partSum = partSum;

        partSum -= this.MOVE;
        this.burdened_speed = 1/Math.ceil(partSum / this.MOVE);

        partSum -= this.CARRY;

        if (partSum == 0){
            this.unburdened_speed = 1;
        }else{
            this.unburdened_speed = 1/Math.ceil(partSum / this.MOVE);
        }
    }
}




