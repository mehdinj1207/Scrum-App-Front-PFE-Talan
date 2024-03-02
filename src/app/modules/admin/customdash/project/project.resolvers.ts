import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { Category, Course, Project, ProjectStatus } from 'app/modules/admin/customdash/project/classes/project.types';
import { ProjectService } from './services/project.service';
import { TicketsService} from './services/ticket.service';
import { Epic, TicketPriority, TicketStatus, TicketType } from './classes/sprint.types';

@Injectable({
    providedIn: 'root'
})
export class ProjectsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _projectsService: ProjectService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Project[]>
    {
        return this._projectsService.getProjects();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ProjectsStatusResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _projectsService: ProjectService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProjectStatus[]>
    {
        return this._projectsService.getProjectsStatus();
    }
}

@Injectable({
    providedIn: 'root'
})
export class TicketsPriorityResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _ticketsService: TicketsService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TicketPriority[]>
    {
        return this._ticketsService.getTicketPriorities();
    }


}

@Injectable({
    providedIn: 'root'
})
export class TicketsTypeResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _ticketsService: TicketsService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TicketType[]>
    {
        return this._ticketsService.getTicketTypes();
    }


}


@Injectable({
    providedIn: 'root'
})
export class TicketsStatusResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _ticketsService: TicketsService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TicketStatus[]>
    {
        return this._ticketsService.getTicketStatus();
    }


}

@Injectable({
    providedIn: 'root'
})
export class EpicResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _ticketsService: TicketsService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Epic[]>
    {
        return this._ticketsService.getEpics();
    }


}