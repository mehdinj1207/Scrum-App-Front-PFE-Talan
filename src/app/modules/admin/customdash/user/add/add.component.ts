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
    selector: 'user-add',
    templateUrl: './add.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAddComponent implements OnInit{
    
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
    detail:boolean=false;
    detailModeVar:string;
    editModeVar: string;
    countries: Country[];
    selectedIso:string='tn'
    selectedIsoEdit:string;
    idDepartment:number;
    role:string;
    emailText:string="";
    emailExist:boolean=false;
    constructor( 
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersListComponent: UserListComponent,
        private _usersService: UserService,
        private _router: Router,
        private _http: HttpClient,
        private sanitizer: DomSanitizer,
        private _formBuilder: FormBuilder,
    ){}
    ngOnInit(): void {
        this.idDepartment=+localStorage.getItem('idDepartment');
        this.role=localStorage.getItem('role');
        this.getDepartments();
        this.getCountriesPhoneCode();
        this.userForm = this._formBuilder.group({
            cin: ['', [Validators.required]],
            firstname: ['', [Validators.required]],
            lastname: ['', [Validators.required]],
            position: ['', [Validators.required]],
            role: ['', [Validators.required]],
            email: ['', [Validators.email, Validators.required]],
            tel: ['', [Validators.required]],
            department: [this.idDepartment, [Validators.required]]
        });
        
        this._changeDetectorRef.markForCheck();
        // Open the drawer
        this._usersListComponent.matDrawer.open();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        this._usersListComponent.matDrawer.opened = false;
        return this._usersListComponent.matDrawer.close();
    }
    addNewUser() {
        this.patchUserValues();
        this._usersService.addUserWithCountry(this.user, this.selectedDepartmentId,this.selectedIso).subscribe(
            data => {
                if (this.image != null) {
                    this._usersService.updateUserSetImage(this.image, data.idUser);
                }
                this.onCloseAfterAdd();
            },
            error => { console.log('Error adding user'); }
        );
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onCloseDrawer() {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute })
        this._usersListComponent.matDrawer.opened = false;
        this._usersListComponent.matDrawer.close();
        this._changeDetectorRef.markForCheck()
    }
    onCloseAfterAdd() {
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
    patchUserValues() {
        this.user.cin = this.userForm.value.cin;
        this.user.firstname = this.userForm.value.firstname;
        this.user.lastname = this.userForm.value.lastname;
        this.user.position = this.userForm.value.position;
        this.user.role = this.userForm.value.role;
        this.user.email = this.userForm.value.email;
        this.user.tel = this.userForm.value.tel;
        this.selectedDepartmentId = this.userForm.value.department;
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

    getCountriesPhoneCode(){
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
    getCountryByIso(iso: string): Country
    {
        return this.countries.find(country => country.iso === iso);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    onEmailChange(){
        if(this.emailText.length>0){
            this._usersService.checkEmailExist(this.emailText).subscribe(
                data=>{
                    this.emailExist=data;
                }
            )
        }
    }
}