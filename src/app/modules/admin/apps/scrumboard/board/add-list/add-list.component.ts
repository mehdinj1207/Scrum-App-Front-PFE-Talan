import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Sprint, WorkflowItem } from 'app/modules/admin/customdash/project/classes/sprint.types';
import { SprintsService } from 'app/modules/admin/customdash/project/services/sprint.service';
import { ScrumboardService } from '../../scrumboard.service';

@Component({
    selector       : 'scrumboard-board-add-list',
    templateUrl    : './add-list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrumboardBoardAddListComponent implements OnInit
{
    @ViewChild('titleInput') titleInput: ElementRef;
    @Input() buttonTitle: string = 'Add a list';
    @Output() readonly saved: EventEmitter<string> = new EventEmitter<string>();

    form: FormGroup;
    formVisible: boolean = false;

    idSprint: string;
    sprint:Sprint=new Sprint()
    workflowItems: WorkflowItem[]=[];
    workflowItem: WorkflowItem= new WorkflowItem()

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _scrumboardService: ScrumboardService,
        private sprintService: SprintsService ,
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

        // Initialize the new list form
        this.form = this._formBuilder.group({
            title: ['']
        });

        //Get the sprint
        this.idSprint = localStorage.getItem("idSprint-backlog")

        //Get the current sprint
        this.getSprintById(Number(this.idSprint))

        //Get the workflowItems of the sprint 
        this.getWorkflowItems(Number(this.idSprint))

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Save
     */
    save(): void
    {
        // Get the new list title
        const title = this.form.get('title').value;

        // Return, if the title is empty
        if ( !title || title.trim() === '' )
        {
            return;
        }

        // Execute the observable
        this.saved.next(title.trim());

        this.addNewWorkflowItem(Number(this.idSprint),this.workflowItem)

        // Clear the new list title and hide the form
        this.form.get('title').setValue('');
        this.formVisible = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle the visibility of the form
     */
    toggleFormVisibility(): void
    {
        // Toggle the visibility
        this.formVisible = !this.formVisible;

        // If the form becomes visible, focus on the title field
        if ( this.formVisible )
        {
            this.titleInput.nativeElement.focus();
        }
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

        this.workflowItem.sprint=this.sprint;
        this.workflowItem.orderNumber=String(this.workflowItems.length+1)
        this.workflowItem.name=this.form.value.title;

        this._scrumboardService.addNewWorkflowItem(idSprint,workflowItem).subscribe(
            data=>{
                
                this._changeDetectorRef.markForCheck();
                window.location.reload()

            }
        )
    }

    getSprintById(idSprint:number){
        this.sprintService.getSprintById(idSprint).subscribe(
            data=>{
                this.sprint=data;
                this._changeDetectorRef.markForCheck();
            }
        )
    }
}
