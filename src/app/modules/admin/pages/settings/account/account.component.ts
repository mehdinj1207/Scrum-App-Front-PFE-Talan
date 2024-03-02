import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppComponent } from 'app/app.component';
import { UserService } from 'app/modules/admin/customdash/user/user.service';
import { Country, Department, User } from 'app/modules/admin/customdash/user/User';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'settings-account',
    templateUrl: './account.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsAccountComponent implements OnInit {
    accountForm: FormGroup;
    urlProjet: String = AppComponent.urlProjet;
    editMode: String;
    userForm: FormGroup;
    userEditForm: FormGroup;
    user: User = new User();
    image: FormData = null;
    ananymousAvatar: string = "../../../../../../assets/images/apps/contacts/blank-profile-picture-973460__340-min.png";
    sanitizedImageUrl: any = this.ananymousAvatar;
    imageURL: string = "";
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public userEdit: User = new User();
    reader: FileReader = new FileReader();
    selectedDepartmentId: number;
    countries: Country[];
    selectedIso: string = 'tn'
    selectedIsoEdit: string;
    department:string;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _usersService: UserService,
        private _router: Router,
        private _http: HttpClient,
        private sanitizer: DomSanitizer,
        private _changeDetectorRef: ChangeDetectorRef
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.getUser(localStorage.getItem('email'));
        this._changeDetectorRef.markForCheck();
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    updateUser() {
        this._usersService.updateUserWithDepartment(this.userEdit, this.userEdit.department.idDepartment, this.userEdit.country.iso).subscribe(
            data => {
                if (this.image != null) {
                    this._usersService.updateUserSetImage(this.image, data.idUser);
                    window.location.reload();
                }
            },
            error => { console.log('Error adding user'); }
        );
    }
    removeAvatar(): void {
        this.sanitizedImageUrl = this.ananymousAvatar;
        this.image = null;
    }
    onFileSelected(event) {
        const file: File = event.target.files[0];
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);

        this._http.post(this.urlProjet + '/uploadgeturl', formData, {
            responseType: 'blob'
        }).subscribe(response => {
            const reader = new FileReader();
            reader.onload = () => {
                this.userEdit.data = null
                this.imageURL = URL.createObjectURL(response);
                this.sanitizedImageUrl = this.sanitizer.bypassSecurityTrustUrl(this.imageURL);
                this._changeDetectorRef.markForCheck();
            };
            reader.readAsDataURL(response);
        });
        this.image = formData;
    }
    getUser(email: string):void {
        this._usersService.getUserByEmail2(email).subscribe(
            data => {
                this.userEdit = data;
                this.department=this.userEdit.department.name
                this._changeDetectorRef.markForCheck();
            }
        )
    }

   

    removeAvatarForEdit() {
        this.userEdit.data = null;
        this.sanitizedImageUrl = this.ananymousAvatar;
        this.image = null;
    }
    getCountriesPhoneCode() {
        // Get the country telephone codes
        this._usersService.countries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((codes: Country[]) => {
                this.countries = codes;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * Get country info by iso code
     *
     * @param iso
     */
    getCountryByIso(iso: string): Country {
        return this.countries.find(country => country.iso === iso);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
