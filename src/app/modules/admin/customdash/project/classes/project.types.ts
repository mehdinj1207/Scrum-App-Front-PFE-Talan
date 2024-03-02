import { Department, User } from "../../user/User";

export interface Category {
    id?: string;
    title?: string;
    slug?: string;
}

export interface Course {
    id?: string;
    title?: string;
    slug?: string;
    description?: string;
    category?: string;
    duration?: number;
    steps?: {
        order?: number;
        title?: string;
        subtitle?: string;
        content?: string;
    }[];
    totalSteps?: number;
    updatedAt?: number;
    featured?: boolean;
    progress?: {
        currentStep?: number;
        completed?: number;
    };
}

export class Project {
    idProject: Number;
    reference: String;
    title: String;
    description: String;
    owner: String;
    projectStatus: ProjectStatus;
    dateCreation: Date;
    endDate: Date
    department: Department;
    color:string;
}

export class ProjectStatus {
    idProjectStatus: Number;
    statusName: String;

}

export class RessourceRole {
    idRessourceRole: Number;
    role: String;
}


export class Ressource {

    idRessource: Number;
    project: Project;
    user: User;
    role: RessourceRole;
}
