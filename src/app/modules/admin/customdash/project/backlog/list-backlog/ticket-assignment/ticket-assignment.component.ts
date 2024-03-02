import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { User } from 'app/modules/admin/customdash/user/User';
import { UserService } from 'app/modules/admin/customdash/user/user.service';
import { Ressource } from '../../../classes/project.types';
import { TicketAssignment, TicketAssignmentRole } from '../../../classes/sprint.types';
import { ProjectService } from '../../../services/project.service';
import { TicketsService } from '../../../services/ticket.service';

@Component({
  selector: 'app-ticket-assignment',
  templateUrl: './ticket-assignment.component.html',
  styleUrls: ['./ticket-assignment.component.scss']
})
export class TicketAssignmentComponent implements OnInit {
  myControl = new FormControl('', [Validators.required]);
  roleControl = new FormControl('', [Validators.required]);
idCurrentProject:number;
idCurrentTicket:number;
availableUsers: User[] = [];
ressources: Ressource[] = [];
roles: TicketAssignmentRole[] = [];
ticketAssignment: TicketAssignment[] = [];
selectedUser:User;
selectedRole: TicketAssignmentRole;
  idPrimaryToReplace: Number;
  idSecondaryToReplace: Number;
  constructor(public dialogRef: MatDialogRef<TicketAssignmentComponent>,
    private router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _activatedRoute: ActivatedRoute,
    private userService: UserService,
    private projectService: ProjectService,
    private ticketService: TicketsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fuseConfirmationService: FuseConfirmationService,) { }

  ngOnInit(): void {
    
    this.idCurrentTicket=+localStorage.getItem('idTicket');
    this.availableUsers = this.data.users;
    this.ticketAssignment = this.data.ticketAssignment;
    this.idCurrentTicket=this.data.idCurrentTicket;
    this.listRoles();
    
  }
  
  cancelAdd() {
    this.dialogRef.close();
  }
  checkUserSelected(): boolean {

    if (this.myControl.value != '') {
      for (let i = 0; i < this.availableUsers.length; i++) {
        if (this.myControl.value == this.availableUsers[i].email)
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
  checkPrimaryRole(): boolean {

    if (this.ticketAssignment) {
      for (let i = 0; i < this.ticketAssignment.length; i++) {
        if (this.ticketAssignment[i].ticketAssignmentRole.role == "Primary"&& this.ticketAssignment[i].ticket.idTicket==this.idCurrentTicket) {
          this.idPrimaryToReplace = this.ticketAssignment[i].idTicketAssignment
          return true
        }
      }
    }
    else return false

    return false


  }

  checkSecondaryRole(): boolean {
    if (this.ticketAssignment) {
      for (let i = 0; i < this.ticketAssignment.length; i++) {
        if (this.ticketAssignment[i].ticketAssignmentRole.role == "Secondary" && this.ticketAssignment[i].ticket.idTicket==this.idCurrentTicket) {
          this.idSecondaryToReplace = this.ticketAssignment[i].idTicketAssignment
          return true
        }
      }
    }
    else return false

    return false



  }
  selectUser(user: User) {
    this.selectedUser = user;
  }
  selectRole(option: TicketAssignmentRole) {
    this.selectedRole = option

  }
  onCloseAfterAdd() {
    this.router.navigate([''], { relativeTo: this._activatedRoute }).then(() => {
      window.location.reload();
    });
    this._changeDetectorRef.markForCheck()
  }
  affectResource() { 
   

    if (this.selectedRole.role == "Primary" && this.checkPrimaryRole() == true) {
      // Open the confirmation dialog
      const confirmation = this._fuseConfirmationService.open({
        title: 'Primary Person Already Exists !',
        message: 'There is an actual Primary Person for this Ticket, do you want to replace him ?',
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
          
          this.ticketService.deleteTicketAssignment(this.idPrimaryToReplace).subscribe(
            data => {
            },
            error => { console.log('Error deleting ressource'); }
          );


          //Add New Product Owner
          
          this.ticketService.addTicketAssignment(this.idCurrentTicket, this.selectedUser.idUser,this.selectedRole.idTicketAssignmentRole).subscribe(
            data => {
              this.cancelAdd();
              window.location.reload();
              this._changeDetectorRef.markForCheck()
            },
            error => { console.log('Error assigning ticket'); }
          );
      

        }
      })
    }


    //Check if role is scrum master : if true ask for override , delete the current and save the new

    if (this.selectedRole.role == "Secondary" && this.checkSecondaryRole() == true) {
      // Open the confirmation dialog
      const confirmation = this._fuseConfirmationService.open({
        title: 'Secondary Person Already Exists !',
        message: 'There is an actual Secondary Person for this Ticket, do you want to replace him ?',
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
          
          this.ticketService.deleteTicketAssignment(this.idSecondaryToReplace).subscribe(
            data => {
              
            },
            error => { console.log('Error deleting ressource'); }
          );

          //Add New Scrum Master
          
          this.ticketService.addTicketAssignment(this.idCurrentTicket, this.selectedUser.idUser,this.selectedRole.idTicketAssignmentRole).subscribe(
            data => {
              this.cancelAdd();
              window.location.reload();
              this._changeDetectorRef.markForCheck()
            },
            error => { console.log('Error assigning ticket'); }
          );
      

        }
      })
    }

    //Close The Modal
    this.cancelAdd()


    if (this.selectedRole.role == "Primary" && this.checkPrimaryRole() == false) {

      //Save the Ressource : new PO 

      this.ticketService.addTicketAssignment(this.idCurrentTicket, this.selectedUser.idUser,this.selectedRole.idTicketAssignmentRole).subscribe(
        data => {
          this.cancelAdd();
          window.location.reload();
          this._changeDetectorRef.markForCheck()
        },
        error => { console.log('Error assigning ticket'); }
      );
  

    }


    if (this.selectedRole.role == "Secondary" && this.checkSecondaryRole() == false) {

      this.ticketService.addTicketAssignment(this.idCurrentTicket, this.selectedUser.idUser,this.selectedRole.idTicketAssignmentRole).subscribe(
        data => {
          this.cancelAdd();
          window.location.reload();
          this._changeDetectorRef.markForCheck()
        },
        error => { console.log('Error assigning ticket'); }
      );
  

    }
  }
  listRoles(){
    this.ticketService.listTicketAssignmentRole().subscribe(
      data=>{
        this.roles=data;
        this._changeDetectorRef.markForCheck();
      },
      error=>{
        console.log('Error Listing Roles')
      }
    )
  }
    


}
