import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { AppComponent } from 'app/app.component';
import { Ceremony, Meet } from './meet.types';
import { Project } from '../project/classes/project.types';
import { User } from '../user/User';

@Injectable({
    providedIn: 'root'
})
export class MeetService {
    url = AppComponent.urlProjet + '/meets';
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }
    /**
         * Oumaima
         */
    meetListByUser() {
        return this._httpClient.get<Meet[]>(this.url + "/user/" + localStorage.getItem("idCurrentUser"));
    }
    projectsByUserInMeet() {
        return this._httpClient.get<Project[]>(this.url + "/user/" + localStorage.getItem("idCurrentUser")+
        "/projects");
    }
    ceremoniesList(){
        return this._httpClient.get<Ceremony[]>(this.url + "/ceremonies");
    }
    addMeet(meet: Meet, idProject:number, idCeremony:number) {
        return this._httpClient.post(this.url+"/user/"+localStorage.getItem("idCurrentUser")+"/project/"+idProject+"/ceremony/"+idCeremony, meet);
    }
    addParticipantsForMeet(idMeet:number, users:User[]){
        return this._httpClient.post(this.url+"/participants/"+idMeet, users);
    }
    getMeetById(idMeet:number){
        return this._httpClient.get<Meet>(this.url + "/"+idMeet);
    }
    participantsListByMeet(idMeet:number){
        return this._httpClient.get<User[]>(this.url + "/participants/"+idMeet);
    }
    updateMeet(idMeet, idProject, idCeremony, meet:Meet){
        return this._httpClient.put<Meet>(this.url + "/"+idMeet+"/project/"+idProject+"/ceremony/"+idCeremony, meet);
    }
    updateParticipantsForMeet(idMeet:number, users:User[]){
        return this._httpClient.post(this.url+"/update/participants/"+idMeet, users);
    }
    deleteMeet(idMeet: number){
        return this._httpClient.delete(this.url + "/" + idMeet);
    }

}