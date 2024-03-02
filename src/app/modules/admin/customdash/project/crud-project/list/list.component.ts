import { ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Category, Course } from 'app/modules/admin/apps/academy/academy.types';

import { Project, ProjectStatus, Ressource } from '../../classes/project.types';
import { ProjectService } from '../../services/project.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { AddProjectComponent } from '../add-project/add-project.component';
import { EditProjectComponent } from '../edit-project/edit-project.component';
import { DetailsProjectComponent } from '../details-project/details-project.component';
import { ProjectMembersComponent } from '../project-members/project-members.component';
import { MatPaginator } from '@angular/material/paginator';


@Component({
    selector: 'academy-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator: MatPaginator;

    consultantRessources: Ressource[] = []
    consultantProjects: Project[] = [];
    idCurrentUser: number = Number(localStorage.getItem('idCurrentUser'))
    projectDepartement: string = localStorage.getItem('userDepartement')
    userRole: string = localStorage.getItem('userRole')
    myId: number = 1;
    projects: Project[] = [];
    project: Project;
    projectsNumber: Number = 0;
    projectStatusList: ProjectStatus[] = [];
    filteredProjects: Project[] = [];
    categories: Category[] = [];
    courses: Course[] = [];
    filteredCourses: Course[];
    filters: {
        statusSlug$: BehaviorSubject<string>;
        query$: BehaviorSubject<string>;
    } = {
            statusSlug$: new BehaviorSubject('all'),
            query$: new BehaviorSubject(''),
        };
    currentPageData: Project[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 6;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private router: Router,
        private _projectService: ProjectService,
        private _fuseConfirmationService: FuseConfirmationService,
        private dialog: MatDialog
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {


        // Get the projects
        this.getProjectList();
        this.getProjectStatus();
        this.filterProjects();
    }

    deleteProject(idProject): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete project',
            message: 'Are you sure you want to delete this project? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._projectService.deleteProject(idProject).subscribe(
                    (data: any) => (this.project = data)
                );
                window.location.reload()
            }
        })
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    addProjectModal() {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.minWidth = "42%";

        dialogConfig.maxHeight = '95vh'
        dialogConfig.autoFocus = true;

        this.dialog.open(AddProjectComponent, dialogConfig);

    }


    editProjectModal(idProject: number) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.minWidth = "42%";
        dialogConfig.maxHeight = '95vh';
        dialogConfig.autoFocus = true;
        dialogConfig.data = idProject;
        this.dialog.open(EditProjectComponent, dialogConfig);
    }

    detailsProjectModal(idProject: number) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.minWidth = "50%";
        dialogConfig.maxWidth = "50%";
        dialogConfig.maxHeight = '100vh'
        dialogConfig.autoFocus = true;
        dialogConfig.data = idProject;
        this.dialog.open(DetailsProjectComponent, dialogConfig);
    }

    showMembersModal(idProject: number) {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.minWidth = "75%";
        dialogConfig.maxWidth = "75%";

        dialogConfig.minHeight = '70vh'
        dialogConfig.maxHeight = '90vh'
        dialogConfig.autoFocus = true;
        dialogConfig.data = idProject;
        this.dialog.open(ProjectMembersComponent, dialogConfig);

    }

    /**
            * Filter by search query
            *
            * @param query
            */
    filterByQuery(query: string): void {
        this.filters.query$.next(query);
    }
    /**
    * Filter by Project Status 
    */
    filterByStatus(change: MatSelectChange): void {
        this.filters.statusSlug$.next(change.value);
        this._changeDetectorRef.markForCheck();
    }

    getConsultantRessources() {

    }

    getProjectList() {

        if (this.userRole == "Manager") {
            this._projectService.projects$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((projects: Project[]) => {


                    this.projects = this.filteredProjects = projects.filter((element) =>
                        element.department.name == this.projectDepartement);

                    this.projectsNumber = this.projects.length;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                })
        }

        if (this.userRole == "Consultant") {
            
            try {
                
                this._projectService.getRessourceByUser(this.idCurrentUser)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((ressources: Ressource[]) => {


                    ressources.map((ressource) => {
                        this.consultantProjects.push(ressource.project)
                    })

                    this.projects = this.filteredProjects = this.currentPageData =  this.consultantProjects
                    

                    this.projectsNumber = this.projects.length;
                    this._changeDetectorRef.markForCheck();
                })


            }
            catch {
                console.log('error consultant ressources')
            }
        }
        ;
    }
    getProjectStatus() {
        this._projectService.projectsStatus$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((projectsStatus: ProjectStatus[]) => {
                this.projectStatusList = projectsStatus;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    filterProjects() {
        combineLatest([this.filters.statusSlug$, this.filters.query$])
            .subscribe(([statusSlug, query]) => {

                // Reset the filtered courses
                
                this.filteredProjects = this.projects;

                // Filter by position
                if (statusSlug !== 'all') {
                    this.filteredProjects = this.filteredProjects.filter(data => data.projectStatus.statusName === statusSlug);
                    this.currentPage = 1;
                    this.onPageChange({ pageIndex: 0, pageSize: this.itemsPerPage, length: this.filteredProjects.length });
                    this._changeDetectorRef.markForCheck();
                }
                // Filter by search query
                if (query !== '') {
                    this.filteredProjects = this.filteredProjects.filter(data => data.title.toLowerCase().includes(query.toLowerCase()));
                    this.currentPage = 1;
                    this.onPageChange({ pageIndex: 0, pageSize: this.itemsPerPage, length: this.filteredProjects.length });
                    this._changeDetectorRef.markForCheck();
                }

                this.updateCurrentPageData();
                this._changeDetectorRef.markForCheck();

            });

    }
    getPageRange() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this._changeDetectorRef.markForCheck();
        return { startIndex: startIndex, endIndex: endIndex };
        
    }
    updateCurrentPageData(): void {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.currentPageData = this.filteredProjects.slice(startIndex, endIndex);
        this._changeDetectorRef.markForCheck();
    }

    onPageChange(event: any): void {
        this.currentPage = event.pageIndex + 1;
        this.itemsPerPage = event.pageSize;
        this.updateCurrentPageData();
        try {
            this.paginator.pageIndex = this.currentPage - 1;
        } catch {
        }

    }
    detailProjectPage(idProject){
        localStorage.setItem("idProject-detail",idProject)
        this.router.navigate(['/dashboard/projects/project-content']);

    }
    changeProjetStatus(idProject:number,statusName: string){
        this._projectService.updateProjectStatus(idProject, statusName).subscribe(
            data=>{
                window.location.reload();
            }
        )
    }


}
