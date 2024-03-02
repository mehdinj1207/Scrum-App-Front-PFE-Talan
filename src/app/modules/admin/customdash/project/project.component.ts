import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { MatDialogConfig,MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddProjectComponent } from './crud-project/add-project/add-project.component'; 
import { ProjectService } from './services/project.service';


@Component({
    selector       : 'project',
    templateUrl    : './project.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectComponent
{
    
    /**
     * Constructor
     */
        constructor(private _userService: ProjectService,
        private _router: Router,
        private dialog: MatDialog)
    {
    }


    addProjectModal(){
        const dialogConfig = new MatDialogConfig();

        dialogConfig.autoFocus = true;

        this.dialog.open(AddProjectComponent, dialogConfig);
    }



}
