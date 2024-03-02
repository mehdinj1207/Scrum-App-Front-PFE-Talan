import { Component, OnInit, Inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
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
  selector: 'app-details-project',
  templateUrl: './details-project.component.html',
  styleUrls: ['./details-project.component.scss']
})
export class DetailsProjectComponent implements OnInit {

  project: Project = new Project();

  projectStatus: ProjectStatus = new ProjectStatus();
  projectStatuses: ProjectStatus[]
  formFieldHelpers: string[] = [''];
  constructor(
    private projectService: ProjectService,
    private router: Router,
    public dialogRef: MatDialogRef<DetailsProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public idProject: number) { }

  ngOnInit(): void {

    this.project = new Project()
    this.project.projectStatus = new ProjectStatus()
    this.findProjectById(this.idProject)
    

  }

  cancelAdd() {
    this.dialogRef.close();
  }

  findProjectById(id: number): void {

    try {
      this.projectService.retrieveProject(id).subscribe(data => {
        
        this.project = data;
      }, error => console.log("can't find the seached project"));
    }
    catch (error) {
      console.log(error)
    }
  }


}
