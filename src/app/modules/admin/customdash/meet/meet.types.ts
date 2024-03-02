import { Project } from "../project/classes/project.types";
import { User } from "../user/User";

export class Ceremony {
    idCeremony:number;
    title:string;
}
export class Meet {
    idMeet;
    title:string;
    repetition:string;
    startDate:Date;
    endDate:Date;
    duration:number;
    allDay:boolean;
    description:string;
    project:Project;
    user:User;
    ceremony:Ceremony;
    roomName:string;
}