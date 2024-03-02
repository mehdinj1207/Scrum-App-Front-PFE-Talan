import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { User } from '../../../user/User';
import { ProjectService } from '../../services/project.service';
import { Ressource } from '../../classes/project.types';

@Component({
  selector: 'app-one-member',
  templateUrl: './one-member.component.html',
  styleUrls: ['./one-member.component.scss']
})
export class OneMemberComponent implements OnInit {

  userRole: string = localStorage.getItem('userRole')
  ressource:Ressource 
  image: FormData = new FormData();

  constructor(public dialogRef: MatDialogRef<OneMemberComponent>,
    private router: Router,
    private projectService: ProjectService,
    private _fuseConfirmationService: FuseConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit(): void {

    this.getRessource(this.data.idProject,this.data.idUser)
  }



  getRessource(idProject:Number,idUser:Number){
    try {
      this.projectService.getRessourceByProjectAndUser(idProject,idUser).subscribe(data => {
        this.ressource = data
        
        
      }, error => console.log("can't find the ressources for this project"));
    }
    catch (error) {
      return
      console.log(error)
    }

  }

  deleteRessource(idUser: Number,idProject:Number) {

    const confirmation = this._fuseConfirmationService.open({
      title: 'Remove Ressource',
      message: 'Are you sure you want to remove this member from the project ?',
      actions: {
        confirm: {
          label: 'Remove'
        }
      }
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this.projectService.deleteRessourceByUserProject(idUser,idProject).subscribe(
          data => {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
          this.router.navigate(['/dashboard/projects/project-content']));
          },
          error => { console.log('Error deleting ressource'); }
        );
      }
    })

    
    //close the modal
    this.cancelAdd()
  }






  cancelAdd() {
    this.dialogRef.close();
  }














}
