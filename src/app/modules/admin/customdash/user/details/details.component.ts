import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { Country, User } from '../User'
import { UserListComponent } from '../list/list.component';
import { UserService } from '../user.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';
import { AppComponent } from 'app/app.component';

@Component({
    selector: 'user-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailsComponent implements OnInit, OnDestroy {
    ananymousAvatar: string = "../../../../../../assets/images/apps/contacts/blank-profile-picture-973460__340-min.png";
    sanitizedImageUrl: any = this.ananymousAvatar;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public userEdit: User = new User();
    selectedDepartmentId: number;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersListComponent: UserListComponent,
        private _usersService: UserService,
        private _router: Router,
    ) {
    }
    /**
     * On init
     */
    ngOnInit(): void {
        if (localStorage.getItem('idUser') == null) {
            localStorage.setItem('idUser', localStorage.getItem('idCurrentUser'));
        }
        this.getUser(+localStorage.getItem('idUser'));
        this.selectedDepartmentId = this.userEdit.department.idDepartment;
        this._changeDetectorRef.markForCheck();
        // Open the drawer
        this._usersListComponent.matDrawer.open();


    }


    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    /**
     * Close the drawer.
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {

        this._usersListComponent.matDrawer.opened = false;
        return this._usersListComponent.matDrawer.close();
    }
    onCloseDrawer() {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute })
        this._usersListComponent.matDrawer.opened = false;
        this._usersListComponent.matDrawer.close();
        this._changeDetectorRef.markForCheck()
    }

    getUser(idUser: number) {
        this._usersService.getUserById(idUser).subscribe(
            data => {
                this.userEdit = data;
            }
        )
    }

}
