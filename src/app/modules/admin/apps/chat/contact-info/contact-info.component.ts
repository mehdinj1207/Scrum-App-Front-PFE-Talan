import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, ChangeDetectorRef  } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Chat, Contact } from 'app/modules/admin/apps/chat/chat.types';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { Country, User } from '../../../customdash/user/User'
import { UserService } from '../../../customdash/user/user.service';
import { ChatService } from '../chat.service';
@Component({
    selector       : 'chat-contact-info',
    templateUrl    : './contact-info.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactInfoComponent
{
    @Input() chat: Chat;
    @Input() drawer: MatDrawer;

    ananymousAvatar: string = "../../../../../../assets/images/apps/contacts/blank-profile-picture-973460__340-min.png";
    sanitizedImageUrl: any = this.ananymousAvatar;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public userEdit: User = new User();
    selectedDepartmentId: number;
profile: User= new User()
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersService: UserService,
        private _router: Router,
        private _chatService: ChatService
    ) {
    }
    /**
     * On init
     */
    ngOnInit(): void {
       
        this.getUser(localStorage.getItem('emailProfile'));
       
        this.updateProfile()
        this._changeDetectorRef.markForCheck();
        // Open the drawer


    }


    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    updateProfile(){
        this._chatService.getSelectedUser().subscribe((user: User) => {
          // Update the profile information using the selected user
          this.profile=user;
          this._changeDetectorRef.markForCheck();
        });
      }

    /**
     * Close the drawer.
     */
    

    getUser(email: string) {
        this._usersService.getUserByEmail2(email).subscribe(
            data => {
                this.userEdit = data;
                this._changeDetectorRef.markForCheck();
            }
        )
    }
}
