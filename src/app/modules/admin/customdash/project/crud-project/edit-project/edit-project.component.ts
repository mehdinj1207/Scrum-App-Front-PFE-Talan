import { Component, OnInit, Inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectStatus } from '../../classes/project.types';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatInputModule } from '@angular/material/input';
import { DateEnv } from '@fullcalendar/core';

import { MAT_DIALOG_DATA, } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.scss']
})
export class EditProjectComponent implements OnInit {

  test: boolean = false

  project: Project;
  fetchedProject: Project;

  initialStartDate: Date
  initialEndDate: Date

  projectStatus: ProjectStatus;
  projectStatuses: ProjectStatus[]
  form: FormGroup
  formFieldHelpers: string[] = [''];
  constructor(
    private projectService: ProjectService,
    private router: Router,
    public dialogRef: MatDialogRef<EditProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public idProject: number) { }

  ngOnInit(): void {

    this.project = new Project()



    this.findProjectById(this.idProject)



  }



  getProjectStatuses() {
    this.projectService.getProjectStatuses().subscribe(data => {
      this.projectStatuses = data;

      //Make the default project status equal to the first row in the ProjectStatus Table which is "Created" 
      //this.project.projectStatus = this.projectStatuses[0]


    })
  }

  addProject() {

    this.fixDates()

    this.projectService.addProject(this.project).subscribe(
      data => {

        this.dialogRef.close();
        window.location.reload()
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


  findProjectById(id: number): void {

    try {
      this.projectService.retrieveProject(id).subscribe(data => {

        this.project = data;
        this.initialStartDate = data.dateCreation
        this.initialEndDate = data.endDate
      }, error => console.log("can't find the seached project"));
    }
    catch (error) {
      console.log(error)
    }
  }

  fixDates() {
    if (this.project.dateCreation != this.initialStartDate) {
      this.project.dateCreation.setDate(new Date(this.project.dateCreation).getDate() + 1)
    }

    if (this.project.endDate != this.initialEndDate) {
      this.project.endDate.setDate(new Date(this.project.endDate).getDate() + 1)
    }
  }

  clearDates(event: any) {
    
    if (event.targetElement.name == "dateCreation") {
        if (event.value > new Date (this.project.endDate) ){
        this.project.dateCreation = new Date(new Date (this.project.endDate).setDate(new Date(this.project.endDate).getDate() - 7))
        }
    }
    else {
      if (event.value < new Date (this.project.dateCreation) ){
        this.project.endDate = new Date(new Date (this.project.dateCreation).setDate(new Date(this.project.dateCreation).getDate() + 7))
        }

    }
  }

}
