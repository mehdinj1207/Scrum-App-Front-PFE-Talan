import { Project } from "../../customdash/project/classes/project.types";

export class Attachment {

    idAttachment:string;
    fileName:string;
    fileType:string;
    fileSize:number;
    owner:string;
    data:Blob;

    project:Project;

}


export class ResponseData{

    fileName:string;
    downloadURL:string;
    fileType:string;
    fileSize:number;

}