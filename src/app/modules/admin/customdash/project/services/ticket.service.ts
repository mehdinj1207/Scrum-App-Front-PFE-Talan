import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Epic, Ticket, TicketAssignment, TicketAssignmentRole, TicketPriority, TicketStatus, TicketType, WorkflowItem } from '../classes/sprint.types'; 
import { AppComponent } from 'app/app.component';
import { User } from '../../user/User';

@Injectable({
    providedIn: 'root'
})
export class TicketsService
{
    // Private
    url = AppComponent.urlProjet + '/tickets';
    urlTicketAssignment= AppComponent.urlProjet + '/ticketAssignment';
    urlTicketAssignmentRole= AppComponent.urlProjet + '/ticketAssignmentRole';
    urlWorkflow= AppComponent.urlProjet + '/workflow';
    urlEpic= AppComponent.urlProjet + '/epic';
    private _ticket: BehaviorSubject<Ticket | null> = new BehaviorSubject(null);
    private _tickets: BehaviorSubject<Ticket[] | null> = new BehaviorSubject(null);
    private _ticketTypes: BehaviorSubject<any> = new BehaviorSubject(null);
    private _ticketPriorities: BehaviorSubject<any> = new BehaviorSubject(null);
    private _ticketStatus: BehaviorSubject<any> = new BehaviorSubject(null);
    private _epics: BehaviorSubject<Epic[] | null> = new BehaviorSubject(null);
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    TicketsListBySprint(idSprint:number) {
        return this._httpClient.get<Ticket[]>(this.url+"/sprint/"+idSprint);
    }


    addTicket(ticket:Ticket, idSprint:number, idType:number, idPriority:number, idEpic:number){
        return this._httpClient.post(this.url+"/sprint/"+idSprint+"/type/"+idType+"/priority/"+idPriority+"/epic/"+idEpic, ticket);
    }

    getTicketById(idTicket:number){
        return this._httpClient.get<Ticket>(this.url+"/"+idTicket);
    }
    updateTicket(ticket :Ticket, idType:number, idPriority:number, idStatus:number, idEpic:number): Observable<Ticket> {
        return this._httpClient.put<Ticket>(this.url + "/"+ticket.idTicket+"/type/"+idType+"/priority/"+idPriority+"/status/"+idStatus+"/epic/"+idEpic, ticket);
    }
    deleteTicket(idTicket:number){
        return this._httpClient.delete(this.url + "/" + idTicket);
    }
    setTicketEstimation(idTicket:number, estimation:number){
        return this._httpClient.get<Ticket>(this.url+"/"+idTicket+"/estimation/"+estimation);
    }
    get ticketTypes$(): Observable<any> {
        return this._ticketTypes.asObservable();
    }
    getTicketTypes(): Observable<any> {
        return this._httpClient.get(AppComponent.urlProjet + "/ticketTypes").pipe(
            tap((response: any) => {
                this._ticketTypes.next(response);
            })
        );
    }
    get ticketPriorities$(): Observable<any> {
        return this._ticketPriorities.asObservable(); 
    }
    getTicketPriorities(): Observable<any> {
        return this._httpClient.get(AppComponent.urlProjet + "/ticketPriorities").pipe(
            tap((response: any) => {
                this._ticketPriorities.next(response);
            })
        ); 
    }
    get ticketStatus$(): Observable<any> {
        return this._ticketStatus.asObservable();
    }
    getTicketStatus(): Observable<any> {
        return this._httpClient.get(AppComponent.urlProjet + "/ticketStatus").pipe(
            tap((response: any) => {
                this._ticketStatus.next(response);
            })
        );
    }
    addTicketAssignment(idTicket: Number, idUser: Number, idRole:Number){
        return this._httpClient.post(this.urlTicketAssignment +"/"+idTicket+"/"+idUser+"/"+idRole,null);
    }
    UsersListByTicket(idTicket:Number) {   
        return this._httpClient.get<User[]>(this.urlTicketAssignment + "/Users/"+ idTicket);
    }
    listTicketAssignment() {
        return this._httpClient.get<TicketAssignment[]>(this.urlTicketAssignment);
    }
    listTicketAssignmentRole() {
        return this._httpClient.get<TicketAssignmentRole[]>(this.urlTicketAssignmentRole);
    }
    deleteTicketAssignment(idTicketAssignment:Number) {
        return this._httpClient.delete(this.urlTicketAssignment+"/"+idTicketAssignment);
    }
    listEpic() {
        return this._httpClient.get<Epic[]>(this.urlEpic+"/project/"+ localStorage.getItem('idProject-detail'));
    }
    get epics$(): Observable<Epic[]>
    {
        return this._epics.asObservable();
    }
    getEpics(): Observable<Epic[]>
    {
        return this._httpClient.get<Epic[]>(this.urlEpic).pipe(
            tap((response: any) => {
                this._epics.next(response);
            })
        );
    }
    getEpicById(idEpic:number) {
        return this._httpClient.get<Epic>(this.urlEpic+"/"+idEpic);
    }
    updateEpic(idEpic:number,epic:Epic): Observable<Epic> {
        return this._httpClient.put<Epic>(this.urlEpic+"/"+idEpic,epic);
    }
    deleteEpic(idEpic:Number) {
        return this._httpClient.delete(this.urlEpic+"/"+idEpic);
    }
    addEpic(epic:Epic){
        return this._httpClient.post(this.urlEpic+"/project/"+ +localStorage.getItem('idProject-detail'),epic);
    }
    listWorkflowItem(idSprint:Number) {
        return this._httpClient.get<WorkflowItem[]>(this.urlWorkflow+"/sprint/"+idSprint);
    }
    selectedWorkflowSource = new Subject<WorkflowItem>();

  setSelectedWorkflow(workflowItem: WorkflowItem) {
    this.selectedWorkflowSource.next(workflowItem);
  }
  getSelectedWorkflow(){
    return this.selectedWorkflowSource.asObservable();
  }
   
}
