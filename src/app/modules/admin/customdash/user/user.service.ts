import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { AppComponent } from 'app/app.component';
import { Country, Department, User } from './User';


@Injectable({
    providedIn: 'root'
})
export class UserService {
    url = AppComponent.urlProjet + '/users';
    urlDep = AppComponent.urlProjet + '/departments';
    urlUseDep=AppComponent.urlProjet + '/users/departments/';
    urlCountries = AppComponent.urlProjet + '/countries';
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    private _departments: BehaviorSubject<any> = new BehaviorSubject(null);
    private  _userListByDepartment: BehaviorSubject<User[] | null> = new BehaviorSubject(null);
    private _countries: BehaviorSubject<Country[] | null> = new BehaviorSubject(null);
    idDepartment: number;

    /**
     * code For test
     */
    private _user: BehaviorSubject<User | null> = new BehaviorSubject(null);
    private _users: BehaviorSubject<User[] | null> = new BehaviorSubject(null);
    constructor(private _httpClient: HttpClient) {
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }
    get users$(): Observable<User[]> {
        return this._users.asObservable();
        
    }
    getUsers(): Observable<User[]> {
        return this._httpClient.get<User[]>(this.url).pipe(
            tap((users) => {
                this._users.next(users);
            })
        );
    }


    /**
     * Search users with given query
     *
     * @param query
     */
    searchUsers(query: string): Observable<User[]> {
        return this._httpClient.get<User[]>('api/apps/users/search', {
            params: { query }
        }).pipe(
            tap((users) => {
                this._users.next(users);
            })
        );
    }

    /**
     * Get user by id
     */
    getUserById(id: number): Observable<User> {
        return this._users.pipe(
            take(1),
            map((users) => {

                // Find the user
                const user = users.find(item => item.idUser === id) || null;

                // Update the user
                this._user.next(user);

                // Return the user
                return user;
            }),
            switchMap((user) => {

                if (!user) {
                    return throwError('Could not found user with id of ' + id + '!');
                }

                return of(user);
            })
        );
    }

    updateUserSetImage(formData:FormData, idUser:Number) {
        this._httpClient.post(this.url+'/upload/'+idUser, formData).subscribe(
            (response) => {
                console.log(response);
            },
            (error) => {
                console.error(error);
            }
        );
    }
    /**
     * Create user
     */
    createUser(): Observable<User> {
        return this.users$.pipe(
            take(1),
            switchMap(users => this._httpClient.post<User>(this.url, {}).pipe(
                map((newUser) => {

                    // Update the users with the new user
                    this._users.next([newUser, ...users]);

                    // Return the new user
                    return newUser;
                })
            ))
        );
    }

    /**
     * Update user
     *
     * @param id
     * @param user
     */


    /**
     * Delete the user
     *
     * @param id
     */


    
    /***************End CODE FOR TEST************** */

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }
    getData(): Observable<any> {
        return this._httpClient.get(this.url+"/active").pipe(
            tap((response: any) => {
                this._data.next(response);
            })
        );
    }
    UserList() {
        return this._httpClient.get<User[]>(this.url);
    }
    departmentList() {
        return this._httpClient.get<Department[]>(this.urlDep);
    }
    activeUsersList() {
        return this._httpClient.get<User[]>(this.url+"/active");
    }
    inactiveUsersList() {
        return this._httpClient.get<User[]>(this.url+"/inactive");
    }
    activateUser(idUser:number) {
        return this._httpClient.get(this.url+"/activate/"+idUser);
    }

    retrieveUser(idUser: number) { return this._httpClient.get<User>(this.url + "/" + idUser); }

    getUserByEmail(){
        return this._httpClient.get<User>(this.url + "/byEmail/" + localStorage.getItem("email"));
    }
    checkEmailExist(email: string){
        return this._httpClient.get<boolean>(this.url + "/check-email/" + email);
    }

    getUserByEmail2(email:string){
        return this._httpClient.get<User>(this.url + "/byEmail/" + email);
    }

    addUser(user: User, idDepartment:number): Observable<User> {
        return this._httpClient.post<User>(this.url+"/department/"+idDepartment, user);
    }
    addUserWithCountry(user: User, idDepartment:number,iso:string): Observable<User> {
        return this._httpClient.post<User>(this.url+"/department/"+idDepartment+"/country/"+iso, user);
    }

    updateUser(user: User): Observable<User> {
        return this._httpClient.put<User>(this.url + "/" + user.idUser, user);
    }
    updateUserWithDepartment(user: User, idDepartment, iso:string): Observable<User> {
        return this._httpClient.put<User>(this.url + "/" + user.idUser+"/department/"+idDepartment+"/country/"+iso, user);
    }

    deleteUser(idUser: number) {
        return this._httpClient.delete(this.url + "/" + idUser);
    }
   // Departments
    get departments$(): Observable<any> {
        return this._departments.asObservable();
    }
    getDepartments(): Observable<any> {
        return this._httpClient.get(this.urlDep).pipe(
            tap((response: any) => {
                this._departments.next(response);
            })
        );
    }
    /**
     * Getter for countries
     */
    get countries$(): Observable<Country[]>
    {
        return this._countries.asObservable();
    }
    /**
     * Get countries
     */
    getCountries(): Observable<Country[]>
    {
        return this._httpClient.get<Country[]>(this.urlCountries).pipe(
            tap((countries) => {
                this._countries.next(countries);
            })
        );
    }

    changePassword(username:string,newPassword:string):Observable<any>{
        return this._httpClient.post("http://localhost:8090/users/changePassword/"+username,newPassword)
    }
    loggedIn(){
        return this._httpClient.get(this.url + "/logged-in/" + localStorage.getItem("idCurrentUser"));
    }
    loggedOut(){
        return this._httpClient.get(this.url + "/logged-out/" + localStorage.getItem("idCurrentUser"));
    }

}