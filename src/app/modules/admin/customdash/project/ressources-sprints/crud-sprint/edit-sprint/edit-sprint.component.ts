import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { ProjectContentComponent } from '../../project-content/project-content.component';
import { Sprint, SprintStatus } from '../../../classes/sprint.types';
import { SprintsService } from '../../../services/sprint.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
@Component({
    selector: 'sprint-edit',
    templateUrl: './edit-sprint.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SprintEditComponent implements OnInit {
    sprint: Sprint = new Sprint();
    idSprint: number;
    errorMsg: string = "";
    idProject: number;
    lastSprint: any;
    oldStartDate:Date;
    oldEndDate:Date;
    statuses:SprintStatus[];
    statusName:string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _projectContentComponent: ProjectContentComponent,
        private _router: Router,
        private _sprintService: SprintsService,
        private _fuseConfirmationService: FuseConfirmationService,
    ) { }
    ngOnInit(): void {
        this.idProject = +localStorage.getItem("idProject-detail");
        this.idSprint = +localStorage.getItem("idSprint");
        this.getSprint();
        this.getSprintStatuses();
        this._changeDetectorRef.markForCheck();
        // Open the drawer
        this._projectContentComponent.matDrawer.open();
    }
    closeDrawer(): Promise<MatDrawerToggleResult> {
        this._projectContentComponent.matDrawer.opened = false;
        return this._projectContentComponent.matDrawer.close();
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    clearStartDate() {
        this.sprint.startDate = null;
    }
    clearEndDate() {
        this.sprint.startDate = null;
    }
    isOverdue(): boolean {
        return moment(this.sprint.startDate, moment.ISO_8601).isBefore(moment(), 'days');
    }
    isEndDateValid(): boolean {
        //return moment(this.sprint.startDate, moment.ISO_8601).isBefore(moment(), 'days');
        if (this.sprint.startDate) {
            const date1 = new Date(this.sprint.endDate)
            const date2 = new Date(this.sprint.startDate)
            return date1 > date2
        }
        return true;
    }
    onCloseDrawer() {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute })
        this._projectContentComponent.matDrawer.opened = false;
        this._projectContentComponent.matDrawer.close();
        this._changeDetectorRef.markForCheck()
    }
    saveSprint() {
        this.fixDates();
        this._sprintService.updateSprint(this.sprint).subscribe(
            data => {
                this.onCloseAfterEdit();
            }
        )
    }
    onCloseAfterEdit() {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute }).then(() => {
            window.location.reload();
        });
        this._projectContentComponent.matDrawer.opened = false;
        this._projectContentComponent.matDrawer.close();
        this._changeDetectorRef.markForCheck()
    }
    checkSprintFields(): boolean {
        if (this.sprint.objective == null || this.sprint.objective.length == 0 ||
            this.sprint.name == null || this.sprint.name.length == 0 ||
            this.sprint.startDate == null || this.sprint.endDate == null) {
            this.errorMsg = "Please make sure you filled correctly all fields"
            return false
        }
        else if (!this.isEndDateValid()) {
            this.errorMsg = "The Due date should be posterior of start date"
            return false;
        }

        return true

    }
    getSprint() {
        this._sprintService.getSprintById(this.idSprint).subscribe(
            data => {
                this.sprint = data
                this.statusName=data.sprintStatus.name;
                this.oldStartDate=data.startDate;
                this.oldEndDate=data.endDate;
                this._changeDetectorRef.markForCheck()
            }
        )
    }
    deleteSprint(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete project',
            message: 'Are you sure you want to delete this sprint? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._sprintService.deleteSprint(this.idSprint).subscribe(
                    (data: any) => (this.sprint = data)
                );
                this.onCloseAfterEdit();
            }
        })
    }
    fixDates() {
        if(this.sprint.startDate!=this.oldStartDate){
            const date1 = new Date(this.sprint.startDate);
            const date2 = new Date(date1.getTime() + 24 * 60 * 60 * 1000);
            this.sprint.startDate = date2;
        }
        if(this.sprint.endDate!=this.oldEndDate){
            const date3 = new Date(this.sprint.endDate);
            const date4 = new Date(date3.getTime() + 24 * 60 * 60 * 1000);
            this.sprint.endDate = date4;
        }
        
    }
    getSprintStatuses(){
        this._sprintService.sprintStatusList().subscribe(
            data=>{
                this.statuses=data;
                this._changeDetectorRef.markForCheck()
            }
        )
    }
    setSprintStatus(status: string): void
    {
        this.statusName=status;
        // Set the value
        this.sprint.sprintStatus=this.statuses.filter(sprintStatus=> sprintStatus.name==status)[0];
    }


d
}