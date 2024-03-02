import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Category, Course, Project, ProjectStatus, Ressource, RessourceRole } from 'app/modules/admin/customdash/project/classes/project.types';
import { AppComponent } from 'app/app.component';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    // Private
    private _categories: BehaviorSubject<Category[] | null> = new BehaviorSubject(null);

    //******************* CODE WROTEN BY OUMAIMA ******************** */
    private _project: BehaviorSubject<Project | null> = new BehaviorSubject(null);
    private _projects: BehaviorSubject<Project[] | null> = new BehaviorSubject(null);
    private _projectStatus: BehaviorSubject<ProjectStatus[] | null> = new BehaviorSubject(null);



    private _ressources: BehaviorSubject<Ressource[] | null> = new BehaviorSubject(null);


    url = AppComponent.urlProjet + '/projects';
    url2 = AppComponent.urlProjet + '/projectStatuses';
    urlRoles = AppComponent.urlProjet + '/ressourceRoles';
    urlsRessource = AppComponent.urlProjet + '/ressources';

    constructor(private _httpClient: HttpClient) {
    }
    get projects$(): Observable<Project[]> {
        return this._projects.asObservable();
    }

    /**
     * Getter for course
     */
    get project$(): Observable<Project> {
        return this._project.asObservable();
    }

    getProjects(): Observable<Project[]> {
        return this._httpClient.get<Project[]>(this.url).pipe(
            tap((response: any) => {
                this._projects.next(response);
            })
        );
    }

    ProjectList() {
        return this._httpClient.get<Project[]>(this.url);
    }

    retrieveProject(idProject: number) {
        return this._httpClient.get<Project>(this.url + "/" + idProject);
    }

    addProject(project: Project) {
        return this._httpClient.post(this.url, project);
    }

    updateProject(project: Project) {
        return this._httpClient.put(this.url + "/" + project.idProject, project);
    }

    deleteProject(idProject: number) {
        return this._httpClient.delete(this.url + "/" + idProject);
    }


    getProjectStatuses(): Observable<ProjectStatus[]> {
        return this._httpClient.get<ProjectStatus[]>(this.url2);

    }

    getProjectRoles(): Observable<RessourceRole[]> {
        return this._httpClient.get<RessourceRole[]>(this.urlRoles)
    }

    getProjectRessources(idProject: Number): Observable<Ressource[]> {
        return this._httpClient.get<Ressource[]>(this.urlsRessource + '/project/' + idProject)
        /*.pipe(
            tap((response: any) => {
                this._ressources.next(response);
            })
        );*/

    }

    ////////////////////////Ressource-Assining////////////////////////

    addRessource(idProject: Number, idUser: Number, idRole: Number) {
        return this._httpClient.post(this.urlsRessource + '/' + idProject + '/' + idUser + '/' + idRole,null);
    }



    deleteRessource(idRessource:Number) {
        return this._httpClient.delete(this.urlsRessource + '/' + idRessource);
    }



    deleteRessourceByUserProject(idUser:Number,idProject:Number){
        return this._httpClient.delete(this.urlsRessource + '/' + idProject + '/' + idUser);
    }


    getRessourceByProjectAndUser (idProject:Number,idUser:Number): Observable<Ressource> {
        return this._httpClient.get<Ressource>(this.urlsRessource + '/project/' + idProject + '/user/' + idUser)
    }

    getRessourceByUser (idUser:Number): Observable<Ressource[]> {
        return this._httpClient.get<Ressource[]>(this.urlsRessource + '/byUser/' + idUser)
    }

    /**
     * Getter for categories
     */
    get categories$(): Observable<Category[]> {
        return this._categories.asObservable();
    }

    /**
     * Getter for Project Statuses 
     */
    get projectsStatus$(): Observable<ProjectStatus[]> {
        return this._projectStatus.asObservable();
    }

    getProjectsStatus(): Observable<ProjectStatus[]> {
        return this._httpClient.get<ProjectStatus[]>(this.url2).pipe(
            tap((response: any) => {
                this._projectStatus.next(response);
            })
        );
    }

    getProjectForConsulant(){
        return this._httpClient.get<Project[]>(this.url+"/consulant/"+localStorage.getItem("idCurrentUser"));
    }
    getProjectsByDepartment(){
        return this._httpClient.get<Project[]>(this.url+"/department/"+localStorage.getItem("idDepartment"));
    }
    getProjectsInProgress(){
        return this._httpClient.get<Project[]>(this.url+"/in-progress/"+localStorage.getItem("idDepartment"));
    }
    updateProjectStatus(idProject, statusName){
        return this._httpClient.get(this.url+"/status/update/"+idProject+"/"+statusName);
    }
    
}
