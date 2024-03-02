import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from 'app/modules/admin/customdash/user/user.service';
import { MatDrawer } from '@angular/material/sidenav';
import { User } from '../User';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';


@Component({
    selector: 'user-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    data: User[]=[];
    allUsers: User[]=[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    ananymousAvatar: string = "../../../../../../assets/images/apps/contacts/ananymous.jpg";
    filteredUser: User[]=[];
    drawerMode: 'side' | 'over';
    editMode: string;
    currentPageData: User[];
    currentPage: number = 1;
    itemsPerPage: number = 4;
    public userEdit: User = new User();
    user: User = new User();
    public connectedUser: User = new User();
    image: FormData = new FormData();
    departments: any;
    inactiveUsers: User[]=[];
    filteredUsers: User[] = [];
    filters: {
        departmentSlug$: BehaviorSubject<string>;
        query$: BehaviorSubject<string>;
    } = {
            departmentSlug$: new BehaviorSubject('all'),
            query$: new BehaviorSubject(''),
        };
    role: string;
    departmentName: String;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _userService: UserService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _usersService: UserService,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {

    }

    ngOnInit(): void {
        this._usersService.loggedIn().subscribe(
            data=>{
                console.log("hiiiiii")
            }
          )
        this.matDrawer.opened = false;
        localStorage.removeItem('detailMode');
        localStorage.removeItem('editMode');
        this.getUsersList();
        this.getConnectedUser();
        this.getDepartments();
        this.initializeFilter();
        this.getInactiveUsers();
        if (this.connectedUser.role == "Human Ressources") {
            this.filterUsers();
        }
        else {
            this.filterUsersByRole();
        }

        this.matDrawerConfiguration();
    }
    getConnectedUser() {
        this.connectedUser = this.allUsers.filter(user => user.email === localStorage.getItem("email"))[0];
        localStorage.setItem('idDepartment', this.connectedUser.department.idDepartment.toString());
        localStorage.setItem('role', this.connectedUser.role.toString());

    }
    initializeFilter() {
        if (this.connectedUser.role == 'Manager' || this.connectedUser.role == 'Consultant') {
            this.filters = {
                departmentSlug$: new BehaviorSubject(this.connectedUser.department.name),
                query$: new BehaviorSubject(''),
            };
        }
        else {
            this.filters = {
                departmentSlug$: new BehaviorSubject('all'),
                query$: new BehaviorSubject(''),
            };
        }
    }


    filterUsersByRole() {
        combineLatest([this.filters.departmentSlug$, this.filters.query$])
            .subscribe(([departmentSlug, query]) => {
                this.getUsersList();

                // Reset the filtered courses
                this.filteredUser = this.data.filter(user => user.department.name === this.connectedUser.department.name);

                // Filter by position
                if (departmentSlug !== this.connectedUser.department.name) {
                    if (departmentSlug === 'all') {
                        this.filteredUser = this.data;
                        this.currentPage = 1;

                        this.onPageChange({ pageIndex: 0, pageSize: this.itemsPerPage, length: this.filteredUser.length });

                    }
                    else {
                        this.filteredUser = this.data;
                        this.filteredUser = this.filteredUser.filter(data => data.department.name === departmentSlug);
                        this.currentPage = 1;

                        this.onPageChange({ pageIndex: 0, pageSize: this.itemsPerPage, length: this.filteredUser.length });

                    }

                }

                // Filter by search query
                if (query !== '') {
                    this.filteredUser = this.filteredUser.filter(data => data.firstname.toLowerCase().includes(query.toLowerCase())
                        || data.lastname.toLowerCase().includes(query.toLowerCase()));
                    this.currentPage = 1;

                    this.onPageChange({ pageIndex: 0, pageSize: this.itemsPerPage, length: this.filteredUser.length });

                }

                this.updateCurrentPageData();
                this._changeDetectorRef.markForCheck();

            });
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



    getUsersList() {
        this._userService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.allUsers = data;
                this._changeDetectorRef.markForCheck();
            });
        this.data=this.allUsers.filter(user => user.email !== localStorage.getItem("email")
          );
        //set ngClass for every user department
        this.data.forEach((element) => {
            element.color = this.classDepartment(element.department.color);
        });
    }

    onBackdropClicked(): void {
        // Go back to the list
        localStorage.removeItem('detailMode');
        localStorage.removeItem('editMode');
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    createUser(): void {
        localStorage.setItem('detailMode', 'add');
        // Go to the new user.
        this.matDrawer.opened = true;
        this._router.navigate(['./', 'user-add'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    editUser(idUser: number): void {

        localStorage.setItem('idUser', idUser.toString());
        // Go to the new user.
        this._router.navigate(['./', 'user-edit'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    detailUser(idUser: number) {
        localStorage.setItem('idUser', idUser.toString());
        localStorage.setItem('detailMode', 'detail');
        // Go to the new user.
        this._router.navigate(['./', 'user-detail'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    deleteUser(iduser: number): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete user',
            message: 'Are you sure you want to delete this user? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._usersService.deleteUser(iduser).subscribe(
                    data => {
                        this.getInactiveUsers();
                        this.getUsersList();
                        this._changeDetectorRef.markForCheck();
                        window.location.reload();
                    },
                    error => { console.log('Error deleting user'); }
                );

                window.location.reload();
            }
        })

        this._changeDetectorRef.markForCheck();

    }
    /**
        * Filter by search query
        *
        * @param query
        */
    filterByQuery(query: string): void {
        this.filters.query$.next(query);
    }
    /**
    * Filter by category 
    */
    filterByPosition(change: MatSelectChange): void {
        this.filters.departmentSlug$.next(change.value);
    }
    /**
    * ngClass for department
    */
    classDepartment(color: string): string {
        return "text-" + color + "-800 bg-" + color + "-100 dark:text-" + color + "-50 dark:bg-" + color + "-500";
    }

    getPageRange() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return { startIndex: startIndex, endIndex: endIndex };
        this._changeDetectorRef.markForCheck();
    }
    updateCurrentPageData(): void {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.currentPageData = this.filteredUser.slice(startIndex, endIndex);
    }

    onPageChange(event: any): void {
        this.currentPage = event.pageIndex + 1;
        this.itemsPerPage = event.pageSize;
        this.updateCurrentPageData();
        try {
            this.paginator.pageIndex = this.currentPage - 1;
        } catch {
        }

    }
    filterUsers() {
        combineLatest([this.filters.departmentSlug$, this.filters.query$])
            .subscribe(([departmentSlug, query]) => {
                this.getUsersList();

                // Reset the filtered courses
                this.filteredUser = this.data;

                // Filter by position
                if (departmentSlug !== 'all') {

                    this.filteredUser = this.filteredUser.filter(data => data.department.name === departmentSlug);
                    this.currentPage = 1;

                    this.onPageChange({ pageIndex: 0, pageSize: this.itemsPerPage, length: this.filteredUser.length });

                }
                // Filter by search query
                if (query !== '') {
                    this.filteredUser = this.filteredUser.filter(data => data.firstname.toLowerCase().includes(query.toLowerCase())
                        || data.lastname.toLowerCase().includes(query.toLowerCase()));
                    this.currentPage = 1;

                    this.onPageChange({ pageIndex: 0, pageSize: this.itemsPerPage, length: this.filteredUser.length });

                }

                this.updateCurrentPageData();
                this._changeDetectorRef.markForCheck();

            });
    }
    matDrawerConfiguration() {
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }

        });
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'over';
                }
                else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    getInactiveUsers(){
        this._userService.inactiveUsersList().subscribe(
            data=>{
                this.inactiveUsers=data;
                this._changeDetectorRef.markForCheck();
            }
        );
    }
    activateUser(idUser){
        this._userService.activateUser(idUser).subscribe(
            data=>{
                window.location.reload();
            }
        )
    }
}
