import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChatService } from 'app/modules/admin/apps/chat/chat.service';
import { Chat, Contact, Message, Profile } from 'app/modules/admin/apps/chat/chat.types';
import { UserService } from '../../customdash/user/user.service';
import { User } from '../../customdash/user/User';

@Injectable({
    providedIn: 'root'
})
export class ChatChatsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _chatService: ChatService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Chat[]> | any
    {
        return this._chatService.getChats();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ChatChatResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _chatService: ChatService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Chat>
    {
        return this._chatService.getChatById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested chat is not available
                       catchError((error) => {

                           // Log the error
                           console.error(error);

                           // Get the parent url
                           const parentUrl = state.url.split('/').slice(0, -1).join('/');

                           // Navigate to there
                           this._router.navigateByUrl(parentUrl);

                           // Throw an error
                           return throwError(error);
                       })
                   );
    }
}

@Injectable({
    providedIn: 'root'
})
export class ChatContactsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _chatService: ChatService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Contact[]> | any
    {
        return this._chatService.getContacts();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ChatProfileResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _chatService: ChatService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Profile> | any
    {
        return this._chatService.getProfile();
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
export class ChatMessageResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _chatService: ChatService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Message[]> | any
    {
        return this._chatService.getMessages();
    }
}
