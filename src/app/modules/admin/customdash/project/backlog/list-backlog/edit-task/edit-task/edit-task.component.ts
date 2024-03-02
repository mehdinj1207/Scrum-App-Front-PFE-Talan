import { ChangeDetectorRef, ChangeDetectionStrategy, Component, Injectable, OnInit, ViewEncapsulation, ViewChild, ViewContainerRef, ElementRef, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BacklogListComponent } from '../../list-backlog.component';
import { TicketsService } from '../../../../services/ticket.service';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Epic, Ticket, TicketPriority, TicketType } from '../../../../classes/sprint.types';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TemplatePortal } from '@angular/cdk/portal';
@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss']
})
export class EditTaskComponent implements OnInit {
  @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
  @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
  private _tagsPanelOverlayRef: OverlayRef;
  task: Ticket;
  ticketPriorities: TicketPriority[];
  ticketTypes: TicketType[];
  taskForm: FormGroup;
  idTicketPriority: number;
  idTicketType: number;
  idSprint: number;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  idTicket: number;
  idSelectedEpic: number;
  selectedPriorityId: number;
  selectedTypeId: number;
  idTicketStatus: number;
  errorMsg: string;
  epics: Epic[] = [];
  tag: Epic;
  epic: Epic;
  tagsEditMode: boolean = false;
  filteredTags: Epic[];
  userRole: string = localStorage.getItem('userRole')
  idEpic: number;
  constructor(private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _backlogListComponent: BacklogListComponent,
    private _router: Router,
    private _ticketService: TicketsService,
    private _fuseConfirmationService: FuseConfirmationService,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef) { }

  ngOnInit(): void {
    this.task = new Ticket();
    this.tag = new Epic();
    this.epic=new Epic();
    this.idSprint = +localStorage.getItem("idSprint-backlog");
    this.idTicket = +localStorage.getItem("idTicket");
    this.listEpic();
    this.getTicketPriorities();
    this.getTicketTypes();
    this.getTask();
    this._backlogListComponent.matDrawer.open();




  }
  listEpic() {
    this._ticketService.epics$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {

        // Store the data
        this.epics = data;
        this.filteredTags=this.epics;
        this._changeDetectorRef.markForCheck();
      });
  }
  updateEpic(tag: Epic, event): void {
    // Update the title on the tag
    tag.name = event.target.value;

    // Update the tag on the server
    this._ticketService.updateEpic(tag.idEpic, tag)
      .pipe(debounceTime(300))
      .subscribe();

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }
  deleteTag(tag: Epic): void {
    // Delete the tag from the server
    this._ticketService.deleteEpic(tag.idEpic).subscribe();


    // Mark for check
    this._changeDetectorRef.detectChanges();
    window.location.reload();
  }
  shouldShowCreateTagButton(inputValue: string): boolean {
    return !!!(inputValue === '' || this.epics.findIndex(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) > -1);
  }
  createTag(title: String): void {
    this.tag.name = title;

    // Create tag on the server
    this._ticketService.addEpic(this.tag)
      .subscribe((response) => {
        this._changeDetectorRef.markForCheck();
        window.location.reload();
        //this._changeDetectorRef.detectChanges();
        // Add the tag to the task
        //this.addTagToTask(response);
      });
    this._changeDetectorRef.detectChanges();
  }
  openTagsPanel(): void {
    // Create the overlay
    this._tagsPanelOverlayRef = this._overlay.create({
      backdropClass: '',
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.block(),
      positionStrategy: this._overlay.position()
        .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
        .withFlexibleDimensions(true)
        .withViewportMargin(64)
        .withLockedPosition(true)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          }
        ])
    });

    // Subscribe to the attachments observable
    this._tagsPanelOverlayRef.attachments().subscribe(() => {

      // Focus to the search input once the overlay has been attached
      this._tagsPanelOverlayRef.overlayElement.querySelector('input').focus();
      this._changeDetectorRef.detectChanges();
    });

    // Create a portal from the template
    const templatePortal = new TemplatePortal(this._tagsPanel, this._viewContainerRef);

    // Attach the portal to the overlay
    this._tagsPanelOverlayRef.attach(templatePortal);

    // Subscribe to the backdrop click
    this._tagsPanelOverlayRef.backdropClick().subscribe(() => {

      // If overlay exists and attached...
      if (this._tagsPanelOverlayRef && this._tagsPanelOverlayRef.hasAttached()) {
        // Detach it
        this._tagsPanelOverlayRef.detach();

        // Reset the tag filter
        this.filteredTags = this.epics;

        // Toggle the edit mode off
        this.tagsEditMode = false;
        this._changeDetectorRef.detectChanges();
      }

      // If template portal exists and attached...
      if (templatePortal && templatePortal.isAttached) {
        // Detach it
        templatePortal.detach();
        this._changeDetectorRef.detectChanges();
      }
    });
    this._changeDetectorRef.detectChanges();
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
  toggleTagsEditMode(): void {
    this.tagsEditMode = !this.tagsEditMode;
  }

  /**
   * Filter tags
   *
   * @param event
   */
  filterTags(event): void {
    // Get the value
    const value = event.target.value.toLowerCase();

    // Filter the tags
    this.filteredTags = this.epics.filter(tag => tag.name.toLowerCase().includes(value));
  }


  /**
   * Delete tag from the task
   *
   * @param tag
   */



  getEpic(idEpic: number) {
    this._ticketService.getEpicById(idEpic).subscribe(
      data => {
        this.epic = data;
        this._changeDetectorRef.markForCheck();
      }
    )
    return this.epic.name;
  }
  getTask() {
    this._ticketService.getTicketById(this.idTicket).subscribe(
      data => {
        this.task = data;
        this.selectedPriorityId = data.ticketPriority.idTicketPriority;
        this.selectedTypeId = data.ticketType.idTicketType;
        this.idTicketStatus = data.ticketStatus.idTicketStatus;
        if(data.epic){
          this.idSelectedEpic=data.epic.idEpic;
          this.idEpic=data.epic.idEpic
        }
        
        this._changeDetectorRef.markForCheck()

      }
    );
  }
  editTask() {

    this._ticketService.updateTicket(this.task, this.selectedTypeId, this.selectedPriorityId, this.idTicketStatus, this.idSelectedEpic).subscribe(
      data => {
        this._changeDetectorRef.markForCheck();
        this.onCloseAfterEdit();

      },
      error => { console.log('Error adding ticket'); }
    );
  }
  getTicketTypes() {
    this._ticketService.ticketTypes$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {

        // Store the data
        this.ticketTypes = data;
        this._changeDetectorRef.markForCheck();
      });
  }
  getTicketPriorities() {
    this._ticketService.ticketPriorities$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {

        // Store the data
        this.ticketPriorities = data;
        this._changeDetectorRef.markForCheck();
      });
  }
  closeDrawer(): Promise<MatDrawerToggleResult> {
    this._backlogListComponent.matDrawer.opened = false;
    return this._backlogListComponent.matDrawer.close();
  }
  onCloseDrawer() {
    this._router.navigate(['../'], { relativeTo: this._activatedRoute })
    this._backlogListComponent.matDrawer.opened = false;
    this._backlogListComponent.matDrawer.close();
    this._changeDetectorRef.markForCheck()
  }
  onCloseAfterEdit() {
    this._router.navigate(['../'], { relativeTo: this._activatedRoute }).then(() => {
      window.location.reload();
    });
    this._backlogListComponent.matDrawer.opened = false;
    this._backlogListComponent.matDrawer.close();
    this._changeDetectorRef.markForCheck()
  }
  deleteTask(): void {

  }
  setTaskPriority(priority): void {
    // Set the value
    this.selectedPriorityId = priority;
  }
  setTaskType(type): void {
    // Set the value
    this.selectedTypeId = type;
  }

  checkTaskFields(): boolean {
    if (this.task.note == null || this.task.note.length == 0 ||
      this.task.name == null || this.task.name.length == 0 ||
      this.selectedPriorityId == null || this.selectedTypeId == null||
      this.idSelectedEpic == null) {
      this.errorMsg = "Please make sure you filled correctly all fields"
      return false
    }

    return true

  }
  deleteTicket(): void {
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: 'Delete Ticket',
      message: 'Are you sure you want to delete this ticket? This action cannot be undone!',
      actions: {
        confirm: {
          label: 'Delete'
        }
      }
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this._ticketService.deleteTicket(this.idTicket).subscribe(
          (data: any) => (this.task = data)
        );
        this.onCloseAfterEdit();
        this._changeDetectorRef.markForCheck()
      }
    })
  }

}
