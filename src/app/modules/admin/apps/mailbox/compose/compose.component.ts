import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, AfterViewInit,ElementRef  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Project } from 'app/modules/admin/customdash/project/classes/project.types';
import { ProjectService } from 'app/modules/admin/customdash/project/services/project.service';
import { User } from 'app/modules/admin/customdash/user/User';
import { calendarColors } from '../../calendar/sidebar/calendar-colors';
import { MailboxService } from '../mailbox.service';
import { Feedback } from '../mailbox.types';
import * as $ from 'jquery';
import { MailboxListComponent } from '../list/list.component';
@Component({
    selector: 'mailbox-compose',
    templateUrl: './compose.component.html',
    styleUrls: ['./compose.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MailboxComposeComponent implements OnInit,AfterViewInit {
    
    participants: User[] = [];
    idProject: number = 0;
    users: User[] = [];
    currentUserEmail: string = "";
    loop: boolean = true;
    loopUser: boolean = true;
    feedback:Feedback=new Feedback();
    projects: Project[] = [];
    idOld: number;
    oldMail: string = "";
    userEmail: string = "";
    lengthUsers: number = 0;
    composeForm: FormGroup;
    copyFields: { cc: boolean; bcc: boolean } = {
        cc: false,
        bcc: false
    };
    quillModules: any = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
            ['clean']
        ]
    };

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<MailboxComposeComponent>,
        private _formBuilder: FormBuilder,
        private _projectService: ProjectService,
        private _changeDetectorRef: ChangeDetectorRef,
        private mailboxService:MailboxService,
        private elementRef: ElementRef,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.currentUserEmail = localStorage.getItem("email");
        this.getProjects()
        this.feedback.urgent=false;
        // Create the form
        this.composeForm = this._formBuilder.group({
            to: ['', [Validators.required, Validators.email]],
            cc: ['', [Validators.email]],
            bcc: ['', [Validators.email]],
            subject: [''],
            body: ['', [Validators.required]]
        });
    }
    ngAfterViewInit(): void {
        $('.rating ul li').on('click', function() {

            let li = $(this),
                ul = li.parent(),
                rating = ul.parent(),
                last = ul.find('.current');
        
            if(!rating.hasClass('animate-left') && !rating.hasClass('animate-right')) {
        
                last.removeClass('current');
        
                ul.children('li').each(function() {
                    let current = $(this);
                    current.toggleClass('active', li.index() > current.index());
                });
        
                rating.addClass(li.index() > last.index() ? 'animate-right' : 'animate-left');
                rating.css({
                    '--x': li.position().left + 'px'
                });
                li.addClass('move-to');
                last.addClass('move-from');
        
                setTimeout(() => {
                    li.addClass('current');
                    li.removeClass('move-to');
                    last.removeClass('move-from');
                    rating.removeClass('animate-left animate-right');
                }, 800);
        
            }
        
        })        
      }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Show the copy field with the given field name
     *
     * @param name
     */
    showCopyField(name: string): void {
        // Return if the name is not one of the available names
        if (name !== 'cc' && name !== 'bcc') {
            return;
        }

        // Show the field
        this.copyFields[name] = true;
    }
    setStar(star:number){
        this.feedback.star=star;
    }
    /**
     * Save and close
     */
    saveAndClose(): void {
        // Close the dialog
        this.matDialogRef.close();
    }
    toggleImportant(){
        this.feedback.urgent = !this.feedback.urgent;
    }
    /**
     * Discard the message
     */
    discard(): void {
        this.matDialogRef.close();
    }

    /**
     * Save the message as a draft
     */
    saveAsDraft(): void {

    }

    /**
     * Send the message
     */
    send(): void {
        this.mailboxService.addFeedback(this.feedback, this.idProject, +localStorage.getItem("idCurrentUser")).subscribe(
            (data:Feedback)=>{
                this.mailboxService.addFeedbackReceivers(this.users,data.idFeedback).subscribe(
                    data=>{
                        window.location.reload();
                        this.matDialogRef.close();
                    }
                )
                
            }
        )

    }
    checkBeforeAdd(){
        if(this.idProject==0 || this.feedback.content==null|| this.feedback.content==""){
            return true
        }
        if(this.lengthUsers==0){
            return true;
        }
        return false;
    }
    getProjectRessources(idProject) {
        this._projectService.getProjectRessources(idProject).subscribe(
            data => {
                if (data != null) {
                    data.forEach(ressource => {
                        if (ressource.user.email != this.currentUserEmail) {
                            this.participants.push(ressource.user);
                            this._changeDetectorRef.markForCheck();
                        }
                    })
                    this._changeDetectorRef.markForCheck();
                } else {
                    console.log("NO participants")
                }

            }, error => {

            }
        )
    }
    addReceiver() {
        let email = this.composeForm.get('emailUser').value;
        let matchingParticipant = this.participants.find(participant => participant.email == email);

        if (matchingParticipant) {
            if (this.users.filter(user => user.email == matchingParticipant.email).length < 1) {
                this.users.push(matchingParticipant);
                this.lengthUsers = this.users.length;
            }
            this.composeForm.get('emailUser').setValue("");

        }
        this.participants = this.participants.filter(participant => participant.email != email);

    }
    getProjects() {
        if (localStorage.getItem("role") == "Manager") {
            this._projectService.getProjectsInProgress().subscribe(
                data => {
                    this.projects = data;
                    this._changeDetectorRef.markForCheck();
                    for (let i = 0; i < this.projects.length; i++) {
                        this.projects[i].color = calendarColors[(calendarColors.length) - i - 1];
                    }
                }
            )
        } else {
            this._projectService.getProjectForConsulant().subscribe(
                data => {
                    this.projects = data;
                    this.projects = this.projects.filter(project=> project.projectStatus.statusName=="In Progress");
                    this._changeDetectorRef.markForCheck();
                    for (let i = 0; i < this.projects.length; i++) {
                        this.projects[i].color = calendarColors[(calendarColors.length) - i - 1];
                    }
                }
            )
        }
    }
    getProject(id: number) {
        let selectedProject: Project = new Project()
        if (!id) {
            return;
        }
        if (this.idOld != id) {
            this.loop = true;
        }
        if (this.loop == true) {
            this.idOld = id;
        }

        selectedProject = this.projects.filter(project => project.idProject == id)[0];

        if (selectedProject != undefined && this.loop) {
            this.participants = [];
            this._projectService.getProjectRessources(selectedProject.idProject).subscribe(
                data => {
                    if (data != null) {
                        data.forEach(ressource => {
                            if (ressource.user.email != this.currentUserEmail) {
                                this.participants.push(ressource.user);
                                this._changeDetectorRef.markForCheck();
                            }
                            this._changeDetectorRef.markForCheck();
                        })
                        this._changeDetectorRef.markForCheck();
                    } else {
                        console.log("NO participants")
                    }

                }, error => {

                }
            )
            this.loop = false;

        }

        return selectedProject;
    }
    getUser(email: string) {
        if (!email) {
            return;
        }
        if (this.oldMail != email) {
            this.loopUser = true;
        }
        if (this.loop == true) {
            this.oldMail = email;
        }
        return this.participants.filter(participant => participant.email == email)[0];

    }
    addParticipant() {
        let matchingParticipant = this.participants.find(participant => participant.email == this.userEmail);

        if (matchingParticipant) {
            if (this.users.filter(user => user.email == matchingParticipant.email).length < 1) {
                this.users.push(matchingParticipant);
                this.lengthUsers=this.users.length
            }
        }
        this.participants = this.participants.filter(participant => participant.email != this.userEmail);
        this.userEmail="";
    }
    filterParticipations() {
        const filteredUsers: User[] = [];
        let user;
        for(let i=0; i<this.participants.length;i++){
            user=this.users.filter(user=> user.idUser==this.participants[i].idUser)[0];
            if(!user){
                filteredUsers.push(this.participants[i]);
            }
        }
        this.participants=filteredUsers;
      }
      removeFromParticipations(idUser){
        const user=this.users.filter(user=> user.idUser== idUser)[0];
        this.users=this.users.filter(user=> user.idUser!= idUser)
        this.participants.push(user);
        this.lengthUsers=this.users.length;

    }
    
}
