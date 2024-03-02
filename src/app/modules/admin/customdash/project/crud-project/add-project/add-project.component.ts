import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectStatus } from '../../classes/project.types';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatInputModule } from '@angular/material/input';
import { DateEnv } from '@fullcalendar/core';
import { DatePipe } from '@angular/common';

import { UserService } from '../../../user/user.service'; 
import { Department, User as User2 } from 'app/modules/admin/customdash/user/User';


@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})
export class AddProjectComponent implements OnInit {

  public currentUser: User2 = new User2();
  public currentDepartement : Department = new Department()
  owner: string = localStorage.getItem('username')
  test: boolean = false
  project: Project;
  projectStatus: ProjectStatus;
  projectStatuses: ProjectStatus[]
  form: FormGroup
  formFieldHelpers: string[] = [''];
  constructor(
    private projectService: ProjectService,
    private router: Router,
    public dialogRef: MatDialogRef<AddProjectComponent>,
    private _fuseConfirmationService: FuseConfirmationService,
    private userService: UserService,
    private _changeDetectorRef: ChangeDetectorRef) {

    this.userService.getUserByEmail2(localStorage.getItem('email')).subscribe((user: User2) => {
      this.currentUser = user;
      this.currentDepartement = user.department;
      // Mark for check
      this._changeDetectorRef.markForCheck();
    })
  }

  ngOnInit(): void {

    this.project = new Project()
    this.projectStatus = new ProjectStatus()
    this.getProjectStatuses()


  }

  getProjectStatuses() {
    this.projectService.getProjectStatuses().subscribe(data => {
      this.projectStatuses = data;

      //Make the default project status equal to the first row in the ProjectStatus Table which is "Created" 
      this.project.projectStatus = this.projectStatuses[0]


    })
  }

  addProject() {

    this.fixDates()
    this.project.department=this.currentDepartement;
    this.project.owner = this.owner;
    this.projectService.addProject(this.project).subscribe(
      data => {

        window.location.reload()

        this.dialogRef.close();
      },
      error => { console.log('Error adding user'); }
    );

  }

  cancelAdd() {
    this.dialogRef.close();
  }

  stringNonAlphaNum(myString: string): boolean {
    const regex = new RegExp("[^a-zA-Z\d]");
    return regex.test(myString);
  }

  checkDates(date1: Date, date2: Date): boolean {
    if (date1 > date2)
      return true
    else
      return false
  }

  fixDates() {
    this.project.dateCreation.setDate(this.project.dateCreation.getDate() + 1)
    this.project.endDate.setDate(this.project.endDate.getDate() + 1)
  }

}
