import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../../user/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Project, Ressource } from '../../classes/project.types';
import { User } from '../../../user/User';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ResourceAffectationComponent } from '../resource-affectation/resource-affectation.component';
import { ProjectMembersComponent } from '../../crud-project/project-members/project-members.component';
import { OneMemberComponent } from '../one-member/one-member.component';
import { SprintsService } from '../../services/sprint.service';
import { Sprint } from '../../classes/sprint.types';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
  selector: 'app-project-content',
  templateUrl: './project-content.component.html',
  styleUrls: ['./project-content.component.scss']
})
export class ProjectContentComponent implements OnInit {
  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  userRole: string = localStorage.getItem('userRole')
  id: number;
  project: Project;
  sprints: Sprint[];
  noExistingSprints: boolean = false;
  currentPageData: Sprint[];
  currentPage: number = 1;
  itemsPerPage: number = 4;
  nbPages: number;
  drawerMode: 'side' | 'over';
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  //wE SHOUUULD DECLARE IT AS [] empty at first
  users: User[] = []
  focused: boolean = false;
  ressources: Ressource[] = []
  image: FormData = new FormData();
  sanitizedImageUrl: any = "../../../../../../assets/images/apps/contacts/blank-profile-picture-973460__340-min.png";
  length_Tab: Number;
  progressSprintExist:boolean=false;

  verifySprintInProgress:boolean=false;

  constructor(
    private projectService: ProjectService,
    private sprintService: SprintsService,
    private userService: UserService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _activatedRoute: ActivatedRoute,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseConfirmationService: FuseConfirmationService) {
  }

  ngOnChanges(): void {
  }

  ngOnInit(): void {
    this.matDrawer.opened = false;
    this.id = +localStorage.getItem("idProject-detail");
    this.canStartSprint();
    //Get The Current Project
    this.getProject()
    //Get The Project's Resources And Retrieve The Users From Them
    this.getResourcesAndUsers()
    this.getSprints();
    this._changeDetectorRef.markForCheck();
    this.matDrawerConfiguration();
  }

  getProject() {
    try {
      this.projectService.retrieveProject(this.id).subscribe(data => {
        this.project = data;
        this._changeDetectorRef.markForCheck();
      }, error => console.log("can't find the searched project"));
    }
    catch (error) {
      console.log(error)
    }
  }

  getResourcesAndUsers() {
    try {
      this.projectService.getProjectRessources(this.id).subscribe(data => {
        //Get The Resources
        this.ressources = data;
        //Retrieve The Users
        for (let j = 0; j < this.ressources.length; j++) {
          this.users.push(data[j].user)
        }
        this._changeDetectorRef.markForCheck();
      }, error => console.log("can't find the Ressources"));
    }
    catch (error) {
      console.log(error)
    }
  }

  affectResourceModal() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.minWidth = "35%";
    dialogConfig.maxHeight = '100vh'
    dialogConfig.autoFocus = true;
    dialogConfig.data = { users: this.users, currentProject: this.project }

    this.dialog.open(ResourceAffectationComponent, dialogConfig);
  }

  showMembersModal(idProject: number) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.minWidth = "75%";
    dialogConfig.maxWidth = "75%";

    dialogConfig.minHeight = '70vh'
    dialogConfig.maxHeight = '90vh'
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.project.idProject;

    this.dialog.open(ProjectMembersComponent, dialogConfig);

  }

  showOneMemberModal(idUser: Number) {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.minWidth = "25%";
    dialogConfig.maxWidth = "25%";

    dialogConfig.minHeight = '20vh'
    dialogConfig.maxHeight = '20vh'
    dialogConfig.autoFocus = true;
    dialogConfig.data = { idProject: this.project.idProject, idUser: idUser }

    this.dialog.open(OneMemberComponent, dialogConfig);
  }

  getSprints() {
    this.sprintService.sprintsList(this.id).subscribe(
      data => {
        if (data.length > 0) {
          this.sprints = data;
          this.length_Tab=data.length
          this.nbPages = Math.floor(data.length / this.itemsPerPage) + 1;
          this.onPageChange({ pageIndex: 0, pageSize: this.itemsPerPage, length: data.length });

          for(let i =0;i<data.length;i++){
            if(data[i].sprintStatus.name == "In Progress")
            {
              this.verifySprintInProgress=true;
              localStorage.setItem("idSprint-backlog",String(data[i].idSprint))
            }
          }
        }
        else {
          this.noExistingSprints = true;
        }
        this._changeDetectorRef.markForCheck();

      }
    )
  }

  onBackdropClicked(): void {
    // Go back to the list
    localStorage.removeItem('detailMode');
    localStorage.removeItem('editMode');
    this._router.navigate(['./'], { relativeTo: this._activatedRoute });
    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  addSprint() {
    this.matDrawer.opened = true;
    this._router.navigate(['./', 'sprint-add'], { relativeTo: this._activatedRoute });
    this._changeDetectorRef.markForCheck();
  }

  editSprint(idSprint) {
    localStorage.setItem("idSprint", idSprint)
    this.matDrawer.opened = true;
    this._router.navigate(['./', 'sprint-edit'], { relativeTo: this._activatedRoute });
    this._changeDetectorRef.markForCheck();
  }

  matDrawerConfiguration() {
    this.matDrawer.openedChange.subscribe((opened) => {
      if (!opened) {
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }
    });
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {

        // Set the drawerMode if the given breakpoint is active
        if (matchingAliases.includes('lg')) {
          this.drawerMode = 'over';
        }
        else {
          this.drawerMode = 'over';
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  //Pagination
  getPageRange() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this._changeDetectorRef.markForCheck();
    return { startIndex: startIndex, endIndex: endIndex };
  }
  updateCurrentPageData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.currentPageData = this.sprints.slice(startIndex, endIndex);
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
    this._changeDetectorRef.markForCheck();
  }



  openScrumboard() {
    this._router.navigateByUrl('/dashboard/scrumboard/2c82225f-2a6c-45d3-b18a-1132712a4234');
  }

  openFileManager(){
    this._router.navigateByUrl('/dashboard/file-manager');
  }


  deleteSprint(idSprint: number): void {
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: 'Delete sprint',
      message: 'Are you sure you want to delete this sprint? This action cannot be undone!',
      actions: {
        confirm: {
          label: 'Delete'
        }
      }
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this.sprintService.deleteSprint(idSprint).subscribe(
          (data: any) => { }
        );
        window.location.reload();
      }
    })
  }
  redirectToBacklog(idSprint: number) {

    localStorage.setItem("idSprint-backlog", idSprint.toString());
    this._router.navigate(['../', 'backlog'], { relativeTo: this._activatedRoute });
  }
  completeSprint(idSprint:number){
    
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: 'Complete sprint',
      message: 'Are you sure you want to complete this sprint? This action cannot be undone!',
      actions: {
        confirm: {
          label: 'Complete'
        }
      }
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this.sprintService.completeSprint(idSprint).subscribe(
          (data: any) => { }
        );
        window.location.reload();
      }
    })
  }
  startSprint(idSprint:number){
    this.sprintService.startSprint(idSprint).subscribe(
      (data: any) => { }
    );
    window.location.reload();
  }
  canStartSprint(){
    this.sprintService.getCurrentSprintByProject(this.id).subscribe(
      data=>{
        console.log(data);
        if(data==null){
          this.progressSprintExist=false;
        }else{
          this.progressSprintExist=true;
        }
        this._changeDetectorRef.markForCheck();
      }
    )
  }
  changeProjetStatus(){
    let statusName=""
    if(this.project.projectStatus.statusName=="Created"){
      statusName="In Progress"
    }
    if(this.project.projectStatus.statusName=="In Progress"){
      statusName="Completed"
    }
    if(statusName=="Completed"){
      const confirmation = this._fuseConfirmationService.open({
        title: 'Terminate Project',
        message: 'Are you sure you want to terminate this project? This action cannot be undone!',
        actions: {
          confirm: {
            label: 'Complete'
          }
        }
      });
      confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {
          this.projectService.updateProjectStatus(this.project.idProject, statusName).subscribe(
            data=>{
                window.location.reload();
            }
        )
        }
      })
    }
    else{
      this.projectService.updateProjectStatus(this.project.idProject, statusName).subscribe(
        data=>{
            window.location.reload();
        }
    )
    }
    
}
}
