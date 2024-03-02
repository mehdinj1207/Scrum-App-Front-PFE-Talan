import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'app/app.component';
import { Subject } from 'rxjs';
import { UserListComponent } from '../list/list.component';
import { Country, User } from '../User';
import { UserService } from '../user.service';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'user-edit',
    templateUrl: './edit.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEditComponent implements OnInit {
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
    editMode1: boolean;
    reader: FileReader = new FileReader();
    departments: any;
    selectedDepartmentId: number;
    detail: boolean = false;
    detailModeVar: string;
    editModeVar: string;
    countries: Country[];
    selectedIso: string = 'tn'
    selectedIsoEdit: string;
    role: string = localStorage.getItem('role');
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersListComponent: UserListComponent,
        private _usersService: UserService,
        private _router: Router,
        private _http: HttpClient,
        private sanitizer: DomSanitizer,
        private _formBuilder: FormBuilder,
    ) { }
    ngOnInit(): void {
        if (localStorage.getItem('idUser') == null) {
            localStorage.setItem('idUser', localStorage.getItem('idCurrentUser'));
        }
        this.getDepartments();
        this.getCountriesPhoneCode();
        this._usersListComponent.matDrawer.open();
        this.userEditForm = this._formBuilder.group({
            cin: ['', [Validators.required]],
            firstname: ['', [Validators.required]],
            lastname: ['', [Validators.required]],
            position: ['', [Validators.required]],
            role: ['', [Validators.required]],
            email: ['', [Validators.email, Validators.required]],
            tel: ['', [Validators.required]]
        });
        this.getUser(+localStorage.getItem('idUser'));
        this.selectedDepartmentId = this.userEdit.department.idDepartment;
        this._changeDetectorRef.markForCheck();
        this.fillUserEditForm();
    }
    closeDrawer(): Promise<MatDrawerToggleResult> {

        this._usersListComponent.matDrawer.opened = false;
        return this._usersListComponent.matDrawer.close();
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    updateUser() {
        this.patchEditUserValues();
        this._usersService.updateUserWithDepartment(this.userEdit, this.selectedDepartmentId, this.selectedIsoEdit).subscribe(
            data => {
                if (this.image != null) {
                    this._usersService.updateUserSetImage(this.image, data.idUser);
                }
                this.onCloseAfterEdit();
            },
            error => { console.log('Error adding user'); }
        );
    }
    onCloseDrawer() {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute })
        this._usersListComponent.matDrawer.opened = false;
        this._usersListComponent.matDrawer.close();
        this._changeDetectorRef.markForCheck()
    }
    onCloseAfterEdit() {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute }).then(() => {
            window.location.reload();
        });
        this._usersListComponent.matDrawer.opened = false;
        this._usersListComponent.matDrawer.close();
        this._changeDetectorRef.markForCheck()
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
    patchEditUserValues() {
        this.userEdit.cin = this.userEditForm.value.cin;
        this.userEdit.firstname = this.userEditForm.value.firstname;
        this.userEdit.lastname = this.userEditForm.value.lastname;
        this.userEdit.position = this.userEditForm.value.position;
        this.userEdit.role = this.userEditForm.value.role;
        this.userEdit.email = this.userEditForm.value.email;
        this.userEdit.tel = this.userEditForm.value.tel;
    }
    getUser(idUser: number) {
        this._usersService.getUserById(idUser).subscribe(
            data => {
                this.userEdit = data;
            }
        )
    }

    fillUserEditForm() {
        this.userEditForm.setValue({
            firstname: this.userEdit.firstname,
            lastname: this.userEdit.lastname,
            cin: this.userEdit.cin,
            position: this.userEdit.position,
            role: this.userEdit.role,
            email: this.userEdit.email,
            tel: this.userEdit.tel,

        });
        this.selectedDepartmentId = this.userEdit.department.idDepartment;
        this.selectedIsoEdit = this.userEdit.country.iso;
    }

    removeAvatarForEdit() {
        this.userEdit.data = null;
        this.sanitizedImageUrl = this.ananymousAvatar;
        this.image = null;
    }
    getDepartments() {
        this._usersService.departments$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.departments = data;
                this._changeDetectorRef.markForCheck();
            });
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