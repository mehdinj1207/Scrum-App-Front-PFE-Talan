import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { ProjectContentComponent } from '../../project-content/project-content.component';
import { Sprint } from '../../../classes/sprint.types';
import { SprintsService } from '../../../services/sprint.service';
@Component({
    selector: 'sprint-add',
    templateUrl: './add-sprint.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SprintAddComponent implements OnInit {
    sprint: Sprint;
    idProject: number;
    errorMsg: string = "";
    lastSprint:any;
    disableDate:boolean=false;
    nextDate:Date;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _projectContentComponent: ProjectContentComponent,
        private _router: Router,
        private _sprintService: SprintsService,
    ) { }
    ngOnInit(): void {
        this.sprint = new Sprint();
        this.idProject = +localStorage.getItem("idProject-detail");
        this.getLastSprint();
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
    isEndDateValid(): boolean {
        //return moment(this.sprint.startDate, moment.ISO_8601).isBefore(moment(), 'days');
        if(this.sprint.startDate){
            const date1 = Date.parse(this.sprint.startDate.toString()) // convert to milliseconds
            const date2 = Date.parse(this.sprint.endDate.toString())
            return date2>date1;
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
        this._sprintService.addSprint(this.sprint, this.idProject).subscribe(
            data => {
                this.onCloseAfterAdd();
            }
        )
    }
    onCloseAfterAdd() {
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
        if (!this.isEndDateValid()) {
            this.errorMsg = "The Due date should be posterior of start date"
            return false;
        }
        
        return true

    }
    getLastSprint() {
        this._sprintService.lastSprintInProject(this.idProject).subscribe(
            data => {
                if(data!=null){
                    const endDate = new Date(data.endDate);
                    endDate.setDate(endDate.getDate() + 1);
                    this.lastSprint=data
                    this.nextDate=endDate;
                    this.sprint.startDate=endDate
                    this.disableDate=true;
                    this._changeDetectorRef.markForCheck()
                }
                else{
                    this.lastSprint=null
                }
            }
        )
    }
    fixDates() {
        if(this.sprint.startDate!=this.nextDate){
            const date1 = new Date(this.sprint.startDate);
            const date2 = new Date(date1.getTime() + 24 * 60 * 60 * 1000);
            this.sprint.startDate=date2;
        }
        const date3 = new Date(this.sprint.endDate);
        const date4 = new Date(date3.getTime() + 24 * 60 * 60 * 1000);
        this.sprint.endDate=date4;
      }
}