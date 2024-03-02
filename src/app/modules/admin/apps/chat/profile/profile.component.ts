import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Profile } from 'app/modules/admin/apps/chat/chat.types';
import { ChatService } from 'app/modules/admin/apps/chat/chat.service';
import { User } from 'app/modules/admin/customdash/user/User';
import { UserService } from 'app/modules/admin/customdash/user/user.service';

@Component({
    selector       : 'chat-profile',
    templateUrl    : './profile.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit, OnDestroy
{
    @Input() drawer: MatDrawer;
    profile: Profile;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    users:User[]=[];
    filteredUsers:User[]=[];
    connectedUser:User;
    /**
     * Constructor
     */
    constructor(private _chatService: ChatService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _userService: UserService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {   this.getUserList()
        this.getConnectedUser()
        // Profile
        this._chatService.profile$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((profile: Profile) => {
                this.profile = profile;
            });
    }
    getUserList(){
        this._userService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.users = data;
                this._changeDetectorRef.markForCheck();
            });
        this.filteredUsers = this.users.filter(user => user.email !== localStorage.getItem("email"));
        this._changeDetectorRef.markForCheck()
        
    }
    getConnectedUser() {
        this.connectedUser = this.users.filter(user => user.email === localStorage.getItem("email"))[0];
        
        this._changeDetectorRef.markForCheck()
        
        

    }
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
