import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Tag, Task } from 'app/modules/admin/apps/tasks/tasks.types';
import { TasksService } from 'app/modules/admin/apps/tasks/tasks.service';
import { TicketsService } from '../../services/ticket.service'; 
import { Sprint, Ticket, TicketAssignment, WorkflowItem } from '../../classes/sprint.types';
import { SprintsService } from '../../services/sprint.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TicketAssignmentComponent } from './ticket-assignment/ticket-assignment.component';
import { User } from '../../../user/User';
import { ProjectService } from '../../services/project.service';
import { Ressource } from '../../classes/project.types';


@Component({
    selector       : 'backlog-list',
    templateUrl    : './list-backlog.component.html',
    styleUrls: ['./list-backlog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BacklogListComponent implements OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    selectedTicket: Ticket;
    tags: Tag[];
    nbTickets:number=0;
    tickets: Ticket[];
    idSprint:number;
    fabonacci=[1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    idTicket:number;
    sprint:Sprint;
    idTicketType:number;
    idTicketStatus:number;
    idTicketPriority:number;
    idTicketEpic:number;
    idTicketWorkflow:number;
    showPoker:boolean=false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userRole: string = localStorage.getItem('userRole');
    users: User[] = []
    assignedUsers: User[]; 
    idCurrentTicket:number;
    ticket:Ticket;
    workflow:WorkflowItem[]=[];
    idCurrentProject:number;
    ressources: Ressource[] = [];
    sprintStatus:string=""
    ticketAssignment: TicketAssignment[] = [];

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private dialog: MatDialog,
        private _tasksService: TasksService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _ticketsService: TicketsService,
        private _sprintService: SprintsService,
        private ticketService: TicketsService,
        private projectService: ProjectService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {   this.assignedUsers = [];
        this.idCurrentProject=+localStorage.getItem('idProject-detail');
        this.sprint=new Sprint;
        this.ticket=new Ticket;
        this.idSprint=+localStorage.getItem("idSprint-backlog")
        this._changeDetectorRef.markForCheck();
        this.getProjectRessources()
        this.getSprint();
        this.getWorkflowItem()
        
        this.getTicketAssignment()
        this.getTickets();
        this._changeDetectorRef.markForCheck();
        this.mediaQueryControl();
        // Subscribe to media query change
        
    }
    getProjectRessources(){
        this.projectService.getProjectRessources(this.idCurrentProject).subscribe(data => {
          this.ressources = data;
          for (let i = 0; i < this.ressources.length; i++) {
            this.users.push(this.ressources[i].user)
          }
          this._changeDetectorRef.markForCheck();
        }, error => console.log("can't find users"));
      }
    affectTicketModal(idTicket:number) {
        const dialogConfig = new MatDialogConfig();
    
        dialogConfig.minWidth = "35%";
        dialogConfig.maxHeight = '100vh'
        dialogConfig.autoFocus = true;
        dialogConfig.data = { users: this.users, ticketAssignment: this.ticketAssignment,idCurrentTicket:idTicket }
        localStorage.setItem('idTicket',idTicket.toString());
       // this.UsersListByTicket(idTicket)
        this.dialog.open(TicketAssignmentComponent, dialogConfig);
      }
    addTask() {
        this.matDrawer.opened = true;
        this._router.navigate(['./', 'task-add'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    
      }
      editTicket(idTicket , event:Event) {
        localStorage.setItem("idTicket", idTicket)
        this.matDrawer.opened = true; 
        this._router.navigate(['./', 'task-edit'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
        
      }
    getSprint(){
        this._sprintService.getSprintById(this.idSprint).subscribe(
            data=>{
                this.sprint=data;
                this.sprintStatus=this.sprint.sprintStatus.name
                this._changeDetectorRef.markForCheck();
            }
        )
    }
    getRandomClass() {
        const classes = ['text-green-800 bg-green-100 dark:text-green-50 dark:bg-green-500', 
                         'text-blue-800 bg-blue-100 dark:text-blue-50 dark:bg-blue-500',
                         'text-purple-800 bg-purple-100 dark:text-purple-50 dark:bg-purple-500',
                         'text-yellow-800 bg-yellow-100 dark:text-yellow-50 dark:bg-yellow-500'];
        const randomIndex = Math.floor(Math.random() * classes.length);
        return classes[randomIndex];
      }
    UsersListByTicket(idTicket:number){
       
        this._ticketsService.UsersListByTicket(idTicket).subscribe(
            data=>{
                this.assignedUsers=data;
                this._changeDetectorRef.markForCheck();
            }
        )
    }
    getTicketAssignment(){
       
        this._ticketsService.listTicketAssignment().subscribe(
            data=>{
                this.ticketAssignment=data;
                this._changeDetectorRef.markForCheck();
            }
        )
    }
    getTickets(){
        this._ticketsService.TicketsListBySprint(this.idSprint).subscribe(
            data=>{
                this.tickets=data;
                this.nbTickets=data.length;
                this._changeDetectorRef.markForCheck();
            }
        )
    }
    geticket(idTicket: number) {
        this._ticketsService.getTicketById(idTicket).subscribe(
          data => {
            this.ticket = data;
            this._changeDetectorRef.markForCheck()
    
          }
        );
      }
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create task
     *
     * @param type
     */
    

    

    /**
     * Task dropped
     *
     * @param event
     */
    dropped(event: CdkDragDrop<Task[]>): void
    {
        // Move the item in the array
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

        // Save the new order
        this._tasksService.updateTasksOrders(event.container.data).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
    mediaQueryControl(){
        this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {

                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    setEstimation(fab){
        this._ticketsService.setTicketEstimation(this.idTicket,fab).subscribe(
            data=>{
                this.showPoker=false;
                this.getTickets();
                this._changeDetectorRef.markForCheck()
            }
        )
    }
    showCards(id){
        this.idTicket=id;
        if(localStorage.getItem("role")=="Manager" && this.sprintStatus!=='Completed'){
            this.showPoker=true;
        }        
    }
    getTicket(idTicket:number){
        this._ticketsService.getTicketById(idTicket).subscribe(
            data=>{
                this.ticket=data;
                console.log(data);
                this.idTicketType=data.ticketType.idTicketType;
                this.idTicketPriority=data.ticketPriority.idTicketPriority;
                this.idTicketStatus=data.ticketStatus.idTicketStatus;
                this.idTicketEpic=data.epic.idEpic
                this._changeDetectorRef.markForCheck();
            }
        )
    }
    getWorkflowItem(){
        this._ticketsService.listWorkflowItem(this.idSprint).subscribe(
            data=>{
                this.workflow=data;
                this._changeDetectorRef.markForCheck()
            }
        )
    }
    setWorkflowItem(idTicket:number, item){
        
        this.getTicket(idTicket)
        this._ticketsService.setSelectedWorkflow(item);
        this.ticket.workflowItem=this.workflow.filter(WorkflowItem=> WorkflowItem.idWorkflowItem==item)[0];
        this._ticketsService.updateTicket(this.ticket, this.idTicketType, this.idTicketPriority, this.idTicketStatus, this.idTicketEpic).subscribe(
            data => {
              this._changeDetectorRef.markForCheck();
              window.location.reload();
      
            },
            error => { console.log('Error adding ticket'); }
          );
    }
}
