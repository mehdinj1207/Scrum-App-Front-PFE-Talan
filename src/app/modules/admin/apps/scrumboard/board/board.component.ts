import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ScrumboardService } from 'app/modules/admin/apps/scrumboard/scrumboard.service';
import { Board, Card, List } from 'app/modules/admin/apps/scrumboard/scrumboard.models';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Ticket, TicketAssignment, WorkflowItem } from 'app/modules/admin/customdash/project/classes/sprint.types';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RenameListComponent } from './rename-list/rename-list.component';
import { TicketsService } from 'app/modules/admin/customdash/project/services/ticket.service';
import { SprintsService } from 'app/modules/admin/customdash/project/services/sprint.service';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { User } from 'app/modules/admin/customdash/user/User';


@Component({
    selector       : 'scrumboard-board',
    templateUrl    : './board.component.html',
    styleUrls      : ['./board.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrumboardBoardComponent implements OnInit, OnDestroy
{
    workflowItems: WorkflowItem[]=[];
    workflowItems2: WorkflowItem[]=[];

    board: Board;
    listTitleForm: FormGroup;

    idSprint: string;

    workflowItem: WorkflowItem= new WorkflowItem()
    workflowItem2: WorkflowItem= new WorkflowItem()
    
    // Private
    private readonly _positionStep: number = 65536;
    private readonly _maxListCount: number = 200;
    private readonly _maxPosition: number = this._positionStep * 500;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    nbTickets:number=0;
    tickets: Ticket[]=[];
    assignedUsers: User[]=[]; 
    ticketAssignment: TicketAssignment[] = [];
    ticket:Ticket = new Ticket();
    image: FormData = new FormData();
    

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _scrumboardService: ScrumboardService,
        private location: Location,
        private router: Router,
        private dialog: MatDialog,
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
    {

        this.idSprint = localStorage.getItem("idSprint-backlog")
        
        //Get the workflowItems of the sprint 
        this.getWorkflowItems(Number(this.idSprint));
        
        // Initialize the list title form
        this.listTitleForm = this._formBuilder.group({
            title: ['']
        });

        //Get the assignements    
        this.getTicketAssignment();

        // Get the board
        this._scrumboardService.board$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((board: Board) => {
                this.board = {...board};

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });


            
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
     * Focus on the given element to start editing the list title
     *
     * @param listTitleInput
     */
    renameList(listTitleInput: HTMLElement): void
    {
        // Use timeout so it can wait for menu to close
        setTimeout(() => {
            listTitleInput.focus();
        });
    }

    /**
     * Add new list
     *
     * @param title
     */
    addList(title: string): void
    {
        // Limit the max list count
        if ( this.board.lists.length >= this._maxListCount )
        {
            return;
        }

        // Create a new list model
        const list = new List({
            boardId : this.board.id,
            position: this.board.lists.length ? this.board.lists[this.board.lists.length - 1].position + this._positionStep : this._positionStep,
            title   : title
        });

        // Save the list
        this._scrumboardService.createList(list).subscribe();
    }

    /**
     * Update the list title
     *
     * @param event
     * @param list
     */
    updateListTitle(event: any, list: List): void
    {
        // Get the target element
        const element: HTMLInputElement = event.target;

        // Get the new title
        const newTitle = element.value;

        // If the title is empty...
        if ( !newTitle || newTitle.trim() === '' )
        {
            // Reset to original title and return
            element.value = list.title;
            return;
        }

        // Update the list title and element value
        list.title = element.value = newTitle.trim();

        // Update the list
        this._scrumboardService.updateList(list).subscribe();
    }

    /**
     * Delete the list
     *
     * @param id
     */
    deleteList(id): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete list',
            message: 'Are you sure you want to delete this list and its cards? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {

                // Delete the list
                this._scrumboardService.deleteList(id).subscribe();
            }
        });
    }

    /**
     * Add new card
     */
    addCard(list: List, title: string): void
    {
        // Create a new card model
        const card = new Card({
            boardId : this.board.id,
            listId  : list.id,
            position: list.cards.length ? list.cards[list.cards.length - 1].position + this._positionStep : this._positionStep,
            title   : title
        });

        // Save the card
        this._scrumboardService.createCard(card).subscribe();
    }

    /**
     * List dropped
     *
     * @param event
     */
    listDropped(event: CdkDragDrop<WorkflowItem[]>): void
    {

        
        // Move the item
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

        // Calculate the positions
        const updated = this._calculatePositions(event);

        // Update the lists
        this._scrumboardService.updateLists(updated).subscribe();

        //######## Updating the Order in Scrumwise ##########//

        // The List's order in front is updated and stored correctly in : event.container.data
        

        //Push the items in a new arrays with correct order
        for(let i = 0 ;i<event.container.data.length;i++){

            this.workflowItems2[i] = new WorkflowItem()

            this.workflowItems2[i].idWorkflowItem=event.container.data[i].idWorkflowItem
            this.workflowItems2[i].name=event.container.data[i].name
            this.workflowItems2[i].orderNumber=event.container.data[i].orderNumber
            this.workflowItems2[i].sprint=event.container.data[i].sprint
            this.workflowItems2[i].tickets=event.container.data[i].tickets

        }

        //We should updated the workflow in the database
        this._scrumboardService.updateWorkflowItemsOrder(this.workflowItems2).subscribe(
            data=>{
                this._changeDetectorRef.markForCheck();
            }
        );

    }





    /**
     * Card dropped
     *
     * @param event
     */
    cardDropped(event: CdkDragDrop<Card[]>): void
    {
        
        
        
        
        // Move or transfer the item
        if ( event.previousContainer === event.container )
        {
            // Move the item
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            
        }
        else
        {
            // Transfer the item
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

            // Update the card's list it
            event.container.data[event.currentIndex].listId = event.container.id;

            this._scrumboardService.UpdateTicketWorkflowItem(event.item.data.idTicket,
                Number(event.container.data[event.currentIndex].listId))
            .subscribe(
                data=>{
                    
                    this._changeDetectorRef.markForCheck();
                }
            )

        }

        // Calculate the positions
        const updated = this._calculatePositions(event);

        // Update the cards
        this._scrumboardService.updateCards(updated).subscribe();
    }

    /**
     * Check if the given ISO_8601 date string is overdue
     *
     * @param date
     */
    isOverdue(date: string): boolean
    {
        return moment(date, moment.ISO_8601).isBefore(moment(), 'days');
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Calculate and set item positions
     * from given CdkDragDrop event
     *
     * @param event
     * @private
     */
    private _calculatePositions(event: CdkDragDrop<any[]>): any[]
    {
        // Get the items
        let items = event.container.data;
        const currentItem = items[event.currentIndex];
        const prevItem = items[event.currentIndex - 1] || null;
        const nextItem = items[event.currentIndex + 1] || null;

        // If the item moved to the top...
        if ( !prevItem )
        {
            // If the item moved to an empty container
            if ( !nextItem )
            {
                currentItem.position = this._positionStep;
            }
            else
            {
                currentItem.position = nextItem.position / 2;
            }
        }
        // If the item moved to the bottom...
        else if ( !nextItem )
        {
            currentItem.position = prevItem.position + this._positionStep;
        }
        // If the item moved in between other items...
        else
        {
            currentItem.position = (prevItem.position + nextItem.position) / 2;
        }

        // Check if all item positions need to be updated
        if ( !Number.isInteger(currentItem.position) || currentItem.position >= this._maxPosition )
        {
            // Re-calculate all orders
            items = items.map((value, index) => {
                value.position = (index + 1) * this._positionStep;
                return value;
            });

            // Return items
            return items;
        }

        // Return currentItem
        return [currentItem];
    }

    goBack(){
        //this.location.back();
        this.router.navigate(['/dashboard/projects/project-content']);
    }
    getWorkflowItems(idSprint:number){
        this._scrumboardService.getWorkflowsBySprint(idSprint).subscribe(
            data=>{
                this.workflowItems=data;
                this._changeDetectorRef.markForCheck();

            }
        )
    }


    addNewWorkflowItem(idSprint:number,workflowItem:WorkflowItem){
        this._scrumboardService.addNewWorkflowItem(idSprint,workflowItem).subscribe(
            data=>{
                
                this._changeDetectorRef.markForCheck();

            }
        )
    }

    deleteWorkflowItem(idWorkflowItem:number,newIdWorkflowItem:number){
            // Open the confirmation dialog
            const confirmation = this._fuseConfirmationService.open({
                title: 'Delete WorkflowItem',
                message: 'Are you sure you want to delete this WorkflowItem? This action cannot be undone!',
                actions: {
                    confirm: {
                        label: 'Delete'
                    }
                }
            });
            confirmation.afterClosed().subscribe((result) => {
                if (result === 'confirmed') {
                    this._scrumboardService.deleteWorkflowItem(idWorkflowItem,newIdWorkflowItem).subscribe(
                        data=>{
                            
                            this._changeDetectorRef.markForCheck();
            
                        }
                    )
                    window.location.reload()
                }
            })

    }



    renameWorkflowItemModal(oldName:string,idWorkflowItem:number) {

        const dialogConfig = new MatDialogConfig();
    
        dialogConfig.minWidth = "25%";
        dialogConfig.maxWidth = "25%";
        dialogConfig.minHeight = '20vh'
        dialogConfig.maxHeight = '20vh'
        dialogConfig.autoFocus = true;
        dialogConfig.data = { oldName:oldName,idWorkflowItem:idWorkflowItem }
    
        this.dialog.open(RenameListComponent, dialogConfig);
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
        this._ticketsService.TicketsListBySprint(Number(this.idSprint)).subscribe(
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













}
