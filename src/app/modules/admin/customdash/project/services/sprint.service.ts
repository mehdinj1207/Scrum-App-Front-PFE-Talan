import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Sprint, SprintStatus } from '../classes/sprint.types'; 
import { AppComponent } from 'app/app.component';

@Injectable({
    providedIn: 'root'
})
export class SprintsService
{
    // Private
    url = AppComponent.urlProjet + '/sprints';
    private _sprint: BehaviorSubject<Sprint | null> = new BehaviorSubject(null);
    private _sprints: BehaviorSubject<Sprint[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for sprints
     */
    get sprints$(): Observable<Sprint[]>
    {
        return this._sprints.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get sprints
     */
    getSprints(idProject:number): Observable<Sprint[]>
    {
        return this._httpClient.get<Sprint[]>(this.url+"/project/"+idProject).pipe(
            tap((sprints) => {
                this._sprints.next(sprints);
            })
        );
    }
    sprintsList(idProject:number) {
        return this._httpClient.get<Sprint[]>(this.url+"/project/"+idProject);
    }

    addSprint(sprint:Sprint, idProject:number){
        return this._httpClient.post(this.url+"/addSprint/"+idProject, sprint);
    }
    
    lastSprintInProject(idProject:number){
        return this._httpClient.get<Sprint>(this.url+"/last/project/"+idProject);
    }

    getSprintById(idSprint:number){
        return this._httpClient.get<Sprint>(this.url+"/"+idSprint);
    }
    updateSprint(sprint :Sprint): Observable<Sprint> {
        return this._httpClient.put<Sprint>(this.url + "/updateSprint/" + sprint.idSprint, sprint);
    }
    deleteSprint(idSprint:number){
        return this._httpClient.delete(this.url + "/" + idSprint);
    }
    sprintStatusList() {
        return this._httpClient.get<SprintStatus[]>(this.url+"/sprintStatuses");
    }
    completeSprint(idSprint :number): Observable<Sprint> {
        return this._httpClient.get<Sprint>(this.url + "/complete/" + idSprint);
    }
    startSprint(idSprint :number): Observable<Sprint> {
        return this._httpClient.get<Sprint>(this.url + "/start/" + idSprint);
    }
    getCurrentSprintByProject(idProject :number){
        return this._httpClient.get<number>(this.url + "/current/project/" + idProject);
    }
}
