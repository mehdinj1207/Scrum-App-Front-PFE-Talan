import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { User } from '../../../user/User';
import { ProjectService } from '../../services/project.service';
import { Ressource } from '../../classes/project.types';
import { ResourceAffectationComponent } from '../../ressources-sprints/resource-affectation/resource-affectation.component'; 
@Component({
  selector: 'app-project-members',
  templateUrl: './project-members.component.html',
  styleUrls: ['./project-members.component.scss']
})
export class ProjectMembersComponent implements OnInit {

  userRole: string = localStorage.getItem('userRole')

  projectRessources: Ressource[] = []

  productOwner: User = new User()
  scrumMaster: User = new User()
  developers: User[] = []

  //Data For the Affect Modal
  users: User[] = []
  ressources: Ressource[] = []

  ///////////////////////////

  focused: boolean = false;
  image: FormData = new FormData();
  sanitizedImageUrl: any = "../../../../../../assets/images/apps/contacts/blank-profile-picture-973460__340-min.png";


  constructor(public dialogRef: MatDialogRef<ProjectMembersComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _changeDetectorRef: ChangeDetectorRef,
    private projectService: ProjectService,
    private _fuseConfirmationService: FuseConfirmationService,
    private dialog: MatDialog) { }





  ngOnInit(): void {

    this.getRessources()



  }

  getRessources() {
    try {
      this.projectService.getProjectRessources(this.data).subscribe(data => {
        this.projectRessources = data
        
        this.dealRessources()
      }, error => console.log("can't find the ressources for this project"));
    }
    catch (error) {
      return
      console.log(error)
    }

  }

  dealRessources(): void {

    if (this.projectRessources) {
      for (let i = 0; i < this.projectRessources.length; i++) {

        if (this.projectRessources[i].role.role == "Product Owner") {
          this.productOwner = this.projectRessources[i].user

        }
        if (this.projectRessources[i].role.role == "Scrum Master") {
          this.scrumMaster = this.projectRessources[i].user
        }

        if (this.projectRessources[i].role.role == "Developer") {
          this.developers.push(this.projectRessources[i].user)
        }
      }
    }

  }


  deleteRessource(idUser: Number, idProject: Number) {

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
        this.projectService.deleteRessourceByUserProject(idUser, idProject).subscribe(
          data => {
            if(this.router.url=="/dashboard/projects"){
              window.location.reload();
            }else{
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
              this.router.navigate(['/dashboard/projects/project-content']));
            }
            
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
  addMember(){
    this.cancelAdd()
    localStorage.setItem("idProject-detail",this.data)
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
              this.router.navigate(['/dashboard/projects/project-content']));
  }

}
