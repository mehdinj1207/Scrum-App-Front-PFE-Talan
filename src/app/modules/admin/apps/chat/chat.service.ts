import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { async, asyncScheduler, BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Chat, ChatMessageDto, Contact, Message, Profile } from 'app/modules/admin/apps/chat/chat.types';
import { KeycloakService } from 'keycloak-angular';
import { Md5 } from 'ts-md5/dist/md5';
import { AppComponent } from 'app/app.component';
import { User } from '../../customdash/user/User';
@Injectable({
    providedIn: 'root'
})
export class ChatService
{   url=AppComponent.urlProjet;
    private _chat: BehaviorSubject<Chat> = new BehaviorSubject(null);
    private _chats: BehaviorSubject<Chat[]> = new BehaviorSubject(null);
    private _contact: BehaviorSubject<Contact> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<Contact[]> = new BehaviorSubject(null);
    private _profile: BehaviorSubject<Profile> = new BehaviorSubject(null);
    private keycloakBaseUrl = 'http://localhost:8180/auth';
  private realm = 'scrumwise';
  private clientId = 'scrumwise-angular';
  private adminUsername = 'admin';
  private adminPassword = 'admin123';
    webSocket: WebSocket;
    chatMessages: ChatMessageDto[] = [];
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        private keycloakService: KeycloakService,
        @Inject('axios') private axios: any)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for chat
     */
    get chat$(): Observable<Chat>
    {
        return this._chat.asObservable();
    }

    /**
     * Getter for chats
     */
    get chats$(): Observable<Chat[]>
    {
        return this._chats.asObservable();
    }

    /**
     * Getter for contact
     */
    get contact$(): Observable<Contact>
    {
        return this._contact.asObservable();
    }

    /**
     * Getter for contacts
     */
    get contacts$(): Observable<Contact[]>
    {
        return this._contacts.asObservable();
    }

    /**
     * Getter for profile
     */
    get profile$(): Observable<Profile>
    {
        return this._profile.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get chats
     */
    getChats(): Observable<any>
    {
        return this._httpClient.get<Chat[]>('api/apps/chat/chats').pipe(
            tap((response: Chat[]) => {
                this._chats.next(response);
            })
        );
    }

    /**
     * Get contact
     *
     * @param id
     */
    getContact(id: string): Observable<any>
    {
        return this._httpClient.get<Contact>('api/apps/chat/contacts', {params: {id}}).pipe(
            tap((response: Contact) => {
                this._contact.next(response);
            })
        );
    }

    /**
     * Get contacts
     */
    getContacts(): Observable<any>
    {
        return this._httpClient.get<Contact[]>('api/apps/chat/contacts').pipe(
            tap((response: Contact[]) => {
                this._contacts.next(response);
            })
        );
    }

    /**
     * Get profile
     */
    getProfile(): Observable<any>
    {
        return this._httpClient.get<Profile>('api/apps/chat/profile').pipe(
            tap((response: Profile) => {
                this._profile.next(response);
            })
        );
    }

    /**
     * Get chat
     *
     * @param id
     */
    getChatById(id: string): Observable<any>
    {
        return this._httpClient.get<Chat>('api/apps/chat/chat', {params: {id}}).pipe(
            map((chat) => {

                // Update the chat
                this._chat.next(chat);

                // Return the chat
                return chat;
            }),
            switchMap((chat) => {

                if ( !chat )
                {
                    return throwError('Could not found chat with id of ' + id + '!');
                }

                return of(chat);
            })
        );
    }

    /**
     * Update chat
     *
     * @param id
     * @param chat
     */
    updateChat(id: string, chat: Chat): Observable<Chat>
    {
        return this.chats$.pipe(
            take(1),
            switchMap(chats => this._httpClient.patch<Chat>('api/apps/chat/chat', {
                id,
                chat
            }).pipe(
                map((updatedChat) => {

                    // Find the index of the updated chat
                    const index = chats.findIndex(item => item.id === id);

                    // Update the chat
                    chats[index] = updatedChat;

                    // Update the chats
                    this._chats.next(chats);

                    // Return the updated contact
                    return updatedChat;
                }),
                switchMap(updatedChat => this.chat$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the chat if it's selected
                        this._chat.next(updatedChat);

                        // Return the updated chat
                        return updatedChat;
                    })
                ))
            ))
        );
    }

    /**
     * Reset the selected chat
     */
    resetChat(): void
    {
        this._chat.next(null);
    }
    
      
    
     

      /*websocket ichat*/
      channel = new Subject<string>();

  public static createChannel(user1: string, user2: string): string {
    let combined: string = '';

    if (user1 < user2) {
      combined = user1 + user2;
    } else {
      combined = user2 + user1;
    }
  
    return Md5.hashStr(combined).toString();
  }

  refreshChannel(channel: string) {
    this.channel.next(channel);
  }

  removeChannel() {
    this.channel.next();
  }

  getChannel(): Observable<any> {
    return this.channel.asObservable();
  }
  messages: Array<Message> = [];
 msgs = new Subject<Array<Message>>();

   

    pushMessage(message: Message) {
        this.messages.push(message);
        this.msgs.next(this.messages);
    }

    filterMessages(channel: string): Array<Message> {
         this.messages.filter(message => channel === message.channel)
            .sort((m1, m2) => {
                if (m1.timestamp > m2.timestamp) {
                    return 1;
                }

                return -1;
            });
            
            return this.messages
            
    }
    resetMessages(): void {
        this.messages = [];
        this.msgs.next(this.messages);
      }

    sendReadReceipt(channelId: string, sender: String, receiver: String) {
        this._httpClient.post('http://localhost:8090/messages', {
            channel: channelId,
            sender: sender,
            receiver: receiver

        });
    }

    getMessages(): Observable<any> {
        
       
        return this.msgs.asObservable();
    }
    chatListByChannel(channelId: string){
       return this._httpClient.get<Message[]>('http://localhost:8090/messages/'+channelId);
    }

    /*userListBySender(senderEmail: string){
        return this._httpClient.get<User[]>('http://localhost:8090/messages/receivers/'+senderEmail);
     }*/
     userListByReceiver(receiverEmail: string): Observable<User[]> {
        return this._httpClient.get<User[]>('http://localhost:8090/messages/senders/' + receiverEmail);
      }

getLastMessage(channelId: string){
        return this._httpClient.get<Message>('http://localhost:8090/messages/channels/'+channelId+'/lastMessage');
     }
 selectedUserSource = new Subject<User>();

  setSelectedUser(user: User) {
    this.selectedUserSource.next(user);
  }
  getSelectedUser(){
    return this.selectedUserSource.asObservable();
  }
  selectedUser = new Subject<User>();

  setUser(user: User) {
    this.selectedUser.next(user);
  }
  getUser(){
    return this.selectedUser.asObservable();
  }
  private newMessageSubject: Subject<void> = new Subject<void>();

  triggerNewMessage() {
    this.newMessageSubject.next();
  }

  getNewMessageTrigger() {
    return this.newMessageSubject.asObservable();
  }
  selectedMessageSource = new Subject<Message>();

  setSelectedMessage(message: Message) {
    this.selectedMessageSource.next(message);
  }
  getSelectedMessage(){
    return this.selectedMessageSource.asObservable();
  }
  


}


