import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project, Ressource, RessourceRole } from '../../classes/project.types';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UserService } from '../../../user/user.service';
import { User } from '../../../user/User';
import { ProjectService } from '../../services/project.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Router } from '@angular/router';



@Component({
  selector: 'app-resource-affectation',
  templateUrl: './resource-affectation.component.html',
  styleUrls: ['./resource-affectation.component.scss']
})
export class ResourceAffectationComponent implements OnInit {

  options: string[] = []

  projectUsers: User[] = []

  currentProject: Project

  allUsers: User[] = []

  externalUsers: User[] = []

  isUsersDataFetched = false;

  projectRessources: Ressource[]

  roles: RessourceRole[]=[];

  selectedUser: User = new User()

  selectedRole: RessourceRole;

  project: Project;

  idPoToReplace: Number;

  idSmToReplace: Number;

  filteredNames: Observable<string[]>;

  myControl = new FormControl('', [Validators.required]);

  roleControl = new FormControl('', [Validators.required]);

  filteredOptions: Observable<String[]>;




  constructor(
    public dialogRef: MatDialogRef<ResourceAffectationComponent>,
    private router: Router,
    private userService: UserService,
    private projectService: ProjectService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fuseConfirmationService: FuseConfirmationService,

  ) {

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.options.slice();
      }),
    );

  }

  ngOnInit(): void {

    //Get the current project
    this.currentProject = this.data.currentProject

    //Get The project's users
    this.projectUsers = this.data.users

    //Get the project's ressources
    this.getRessources()

    //Get All Users
    this.getUsers()

    //Get The Available Users to add for the project : this fuction 
    //must wait the previous function thats why timeout 1000 but not optimal => to be fixed later 
    setTimeout(() => {
      this.getAvailableUsers()
    }, 500);

    //Get All Roles
    this.getRoles()

  }

  getUsers() {
    try {
      this.userService.getUsers().subscribe(data => {
        this.allUsers = data;
      }, error => console.log("can't find the users"));
    }
    catch (error) {
      console.log(error)
    }
  }

  getAvailableUsers() {

    //Disjoin the actual project users from all users
    const disjoinedArray = this.allUsers.filter((element) =>
      !this.projectUsers.some((p) => p.email === element.email));

    // Get the active users that belong to the departement of the manager  
    const activeUsers = disjoinedArray.filter((element)=>
    element.status == false && element.department.name == localStorage.getItem('userDepartement')
    )

    this.externalUsers = activeUsers
  }

  getRoles() {
    try {
      this.projectService.getProjectRoles().subscribe(data => {
        this.roles = data;
      }, error => console.log("can't find the roles"));
    }
    catch (error) {
      console.log(error)
    }
  }

  getRessources() {
    try {
      this.projectService.getProjectRessources(this.data.currentProject.idProject).subscribe(data => {
        this.projectRessources = data
      }, error => console.log("can't find the ressources for this project"));
    }
    catch (error) {
      return
      console.log(error)
    }

  }

  checkUserSelected(): boolean {

    if (this.myControl.value != '') {
      for (let i = 0; i < this.externalUsers.length; i++) {
        if (this.myControl.value == this.externalUsers[i].email)
          return true
      }
      return false

    }

  }

  checkRoleSelected() {
    for (let i = 0; i < this.roles.length; i++) {
      if (this.roleControl.value == this.roles[i].role)
        return true
    }
    return false
  }

  affectResource() {

 

    //Check if role is product owner: if true ask for override , delete the current and save the new

    if (this.selectedRole.role == "Product Owner" && this.checkProductOwner() == true) {
      // Open the confirmation dialog
      const confirmation = this._fuseConfirmationService.open({
        title: 'Product Owner Already Exists !',
        message: 'There is an actual Product Owner for this Projet, do you want to replace him ?',
        actions: {
          confirm: {
            label: 'Replace'
          }
        }
      });

      //Close the Modal
      this.cancelAdd()

      confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {

          //Delete Old Product Owner
          
          this.projectService.deleteRessource(this.idPoToReplace).subscribe(
            data => {
              
            },
            error => { console.log('Error deleting ressource'); }
          );


          //Add New Product Owner
          
          this.projectService.addRessource(this.data.currentProject.idProject,
            this.selectedUser.idUser, this.selectedRole.idRessourceRole).subscribe(
              data => {
                
                this.dialogRef.close();
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                  this.router.navigate(['/dashboard/projects/project-content']));

              },
              error => { console.log('Error adding ressource'); }
            );

        }
      })
    }


    //Check if role is scrum master : if true ask for override , delete the current and save the new

    if (this.selectedRole.role == "Scrum Master" && this.checkScrumMaster() == true) {
      // Open the confirmation dialog
      const confirmation = this._fuseConfirmationService.open({
        title: 'Scrum Master Already Exists !',
        message: 'There is an actual Scrum Master for this Projet, do you want to replace him ?',
        actions: {
          confirm: {
            label: 'Replace'
          }
        }
      });

      //Close the Modal
      this.cancelAdd()

      confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {


          //Delete Old Scrum Master
          
          this.projectService.deleteRessource(this.idSmToReplace).subscribe(
            data => {
              
            },
            error => { console.log('Error deleting ressource'); }
          );

          //Add New Scrum Master
          
          this.projectService.addRessource(this.data.currentProject.idProject,
            this.selectedUser.idUser, this.selectedRole.idRessourceRole).subscribe(
              data => {
                
                this.dialogRef.close();
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                  this.router.navigate(['/dashboard/projects/project-content']));

              },
              error => { console.log('Error adding ressource'); }
            );

        }
      })
    }

    //Close The Modal
    this.cancelAdd()


    if (this.selectedRole.role == "Product Owner" && this.checkProductOwner() == false) {

      //Save the Ressource : new PO 

      this.projectService.addRessource(this.data.currentProject.idProject,
        this.selectedUser.idUser, this.selectedRole.idRessourceRole).subscribe(
          data => {
            
            this.dialogRef.close();
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
              this.router.navigate(['/dashboard/projects/project-content']));

          },
          error => { console.log('Error adding user'); }
        );

    }


    if (this.selectedRole.role == "Scrum Master" && this.checkScrumMaster() == false) {

      //Save the Ressource : new SM

      this.projectService.addRessource(this.data.currentProject.idProject,
        this.selectedUser.idUser, this.selectedRole.idRessourceRole).subscribe(
          data => {
           
            this.dialogRef.close();
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
              this.router.navigate(['/dashboard/projects/project-content']));

          },
          error => { console.log('Error adding user'); }
        );

    }


    if (this.selectedRole.role == "Developer") {

      //Save the Ressource : new SM
      this.projectService.addRessource(this.data.currentProject.idProject,
        this.selectedUser.idUser, this.selectedRole.idRessourceRole).subscribe(
          data => {
            
            this.dialogRef.close();
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
              this.router.navigate(['/dashboard/projects/project-content']));

          },
          error => { console.log('Error adding user'); }
        );



    }

  }

  selectRole(option: RessourceRole) {
    this.selectedRole = option

  }

  selectUser(user: User) {
    this.selectedUser = user;
  }

  checkProductOwner(): boolean {

    if (this.projectRessources) {
      for (let i = 0; i < this.projectRessources.length; i++) {
        if (this.projectRessources[i].role.role == "Product Owner") {
          this.idPoToReplace = this.projectRessources[i].idRessource
          return true
        }
      }
    }
    else return false

    return false


  }

  checkScrumMaster(): boolean {
    if (this.projectRessources) {
      for (let i = 0; i < this.projectRessources.length; i++) {
        if (this.projectRessources[i].role.role == "Scrum Master") {
          this.idSmToReplace = this.projectRessources[i].idRessource
          return true
        }
      }
    }
    else return false

    return false



  }


  filterNames(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(name => name.toLowerCase().includes(filterValue));
  }

  private _filter(name: string): string[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }


  cancelAdd() {
    this.dialogRef.close();
  }

  stringNonAlphaNum(myString: string): boolean {
    const regex = new RegExp("[^a-zA-Z\d]");
    return regex.test(myString);
  }



}
