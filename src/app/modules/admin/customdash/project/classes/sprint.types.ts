import { User } from "../../user/User";
import { Project } from "./project.types";

export class TicketType {
    idTicketType: number;
    name: string;
}
export class TicketStatus {
    idTicketStatus: number;
    name: string;
}
export class TicketPriority {
    idTicketPriority: number;
    name: string;
}
export class Epic{
    idEpic:number;
    name:String;
    project:Project;


}
export class Ticket {
    idTicket: number;
    name: string;
    note: string;
    estimation: number;
    ticketStatus: TicketStatus;
    ticketType: TicketType;
    ticketPriority: TicketPriority
    epic: Epic;
    workflowItem: WorkflowItem;
    
}
export class SprintStatus {
    idSprintStatus: Number;
    name: string;
}
export class WorkflowItem {
    idWorkflowItem: number;
    name: string;
    orderNumber: string;
    sprint: Sprint
    tickets:Ticket[];
} 

export class Sprint {
    idSprint: number;
    name: string;
    objective: string;
    totalEstimation: number;
    sprintNumber: number;
    sprintStatus: SprintStatus;
    startDate: Date;
    endDate: Date;
    project: Project;
    workflowItems:WorkflowItem[];
}
export class TicketAssignmentRole {

    idTicketAssignmentRole: Number;
    role: String;
}
export class TicketAssignment {

    idTicketAssignment: Number;
    ticket: Ticket;
    user: User;
    ticketAssignmentRole: TicketAssignmentRole;
}