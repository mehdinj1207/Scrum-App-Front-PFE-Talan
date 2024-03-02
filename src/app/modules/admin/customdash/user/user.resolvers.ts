import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from 'app/modules/admin/customdash/user/user.service';
import { Country, Department, User } from './User';

@Injectable({
    providedIn: 'root'
})
export class UserResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _usersService: UserService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User[]>
    {
        return this._usersService.getUsers();
    }
}

@Injectable({
    providedIn: 'root'
})
export class UserUserResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _usersService: UserService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Department>
    {
        return this._usersService.getDepartments()
    }
}

@Injectable({
    providedIn: 'root'
})
export class UserDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _usersService: UserService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User[]>
    {
        return this._usersService.getData();
    }
}

@Injectable({
    providedIn: 'root'
})
export class UsersCountriesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _usersService: UserService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Country[]>
    {
        return this._usersService.getCountries();
    }


}