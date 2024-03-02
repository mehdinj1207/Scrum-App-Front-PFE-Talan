import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Subject, BehaviorSubject, Observable, forkJoin, Subscription, merge } from 'rxjs';
import { takeUntil, map, tap, switchMap } from 'rxjs/operators';
import { Chat, Profile } from 'app/modules/admin/apps/chat/chat.types';
import { ChatService } from 'app/modules/admin/apps/chat/chat.service';
import * as Stomp from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { UserService } from 'app/modules/admin/customdash/user/user.service';
import { User } from 'app/modules/admin/customdash/user/User';
import { Message } from 'app/modules/admin/apps/chat/chat.types';
import { TRANSLOCO_LANG } from '@ngneat/transloco';
import { RxStompService } from '@stomp/ng2-stompjs';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
    selector       : 'chat-chats',
    templateUrl    : './chats.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatsComponent implements OnInit, OnDestroy
{
    chats: Chat[];
    users:User[]=[];
    
    drawerComponent: 'profile' | 'new-chat';
    drawerOpened: boolean = false;
    filteredChats: Chat[];;
    filteredChat: User[]=[];
    selectedUserChat:User= new User();
    profile: Profile;
    selectedChat: Chat;
    selectedUsers:User[]=[]
    lastMessages: {[email: string]: Message} = {};
    senders:User[]=[];
    filteredUsers:User[]=[];
    connectedUser:User;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    lastMessageContent$: Observable<string>; 
    @Input() selectedUser: User;
    username: string;
    highlightedUsers: Array<string> = [];
    newConnectedUsers: Array<string> = [];
    channel: string;
    receiver: string;
    topicSubscription;
    filteredMessages: Array<Message> = [];

    private newMessageSubscription: Subscription;
    /**
     * Constructor
     */
    constructor(
        private _chatService: ChatService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private stompService: RxStompService,
         private snackBar: MatSnackBar
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    { 
        this.selectedUsers.push(this.selectedUser);
        

        this.connectedUser=new User()
         this.getUserList()
        this.getConnectedUser()
        this.getselecteduser()
        
        // Chats
        this._chatService.chats$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chats: Chat[]) => {
               this.chats = this.filteredChats = chats;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            this._chatService.getUser().subscribe(user => {
              if (user) {
                this.filteredChat.push(user);
              }
            });
          
            this.userListBySender()
            .pipe(
              switchMap(() => this.getLastMessage())
            )
            .subscribe(() => {
              // All messages have been retrieved
              
            });
            
            

            this.newMessageSubscription = this._chatService.getNewMessageTrigger().subscribe(() => {
              // Execute the getLastMessage() method here
              this.getLastMessage();
              this._changeDetectorRef.detectChanges()
            });
        // Profile
        this._chatService.profile$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((profile: Profile) => {
                this.profile = profile;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Selected chat
        this._chatService.chat$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chat: Chat) => {
                this.selectedChat = chat;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.newMessageSubscription.unsubscribe();
    }
    getUserList(){
        this._userService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.users = data;

                this._changeDetectorRef.markForCheck();
            });
        this.filteredUsers = this.users.filter(user => user.email !== localStorage.getItem("email"));
        this._changeDetectorRef.markForCheck()
        
    }
    getConnectedUser() {
        this.connectedUser = this.users.filter(user => user.email === localStorage.getItem("email"))[0];
        this._changeDetectorRef.markForCheck()
        
        

    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter the chats
     *
     * @param query
     */
    filterChats(query: string): void
    {
        // Reset the filter
        if ( !query )
        {
            this.filteredChat = this.senders;
            return;
        }

        this.filteredChat = this.senders.filter(chat => chat.firstname.toLowerCase().includes(query.toLowerCase()));
    }

    /**
     * Open the new chat sidebar
     */
    openNewChat(): void
    {
        this.drawerComponent = 'new-chat';
        this.drawerOpened = true;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Open the profile sidebar
     */
    openProfile(): void
    {
        this.drawerComponent = 'profile';
        this.drawerOpened = true;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    
   /* getLastMessage(emailSelectedUser: string): void {
        const channelId = ChatService.createChannel(emailSelectedUser, this.connectedUser.email);
        this.lastMessageContent$ = this._chatService.getLastMessage(channelId).pipe(
          map(response => response.content)
        );
        
      }*/
      /*getLastMessage(emailSelectedUser: string): Observable<string> {
        const channelId = ChatService.createChannel(emailSelectedUser, this.connectedUser.email);
        return this._chatService.getLastMessage(channelId).pipe(
          map(response => response.content)
        );
      }*/
      getselecteduser(){
        this._chatService.getUser().subscribe((user: User) => {
          // Update the profile information using the selected user
          this.selectedUserChat=user;
          this._changeDetectorRef.detectChanges()
        });
      }
      userListBySender(): Observable<any> {
        return this._chatService.userListByReceiver(localStorage.getItem("email")).pipe(
          tap(response => {
            this.filteredChat=this.senders = response;
            
            
              
            
            this.subscribeToOtherUsers(response, this.connectedUser.email);
            this._changeDetectorRef.detectChanges()
          })
        );
      }
      userListBySender2(): Observable<any> {
        return this._chatService.userListByReceiver(localStorage.getItem("email")).pipe(
          tap(response => {
            this.filteredChat=this.senders = response;
            
            
              
            
            this._changeDetectorRef.detectChanges()
          })
        );
      }
      
      getLastMessage(): Observable<Message[]> {
        const observables: Observable<Message>[] = [];
      
        this.senders.forEach(chat => {
          const channelId = ChatService.createChannel(chat.email, this.connectedUser.email);
          const observable = this._chatService.getLastMessage(channelId).pipe(
            tap(response => {
              this.lastMessages[chat.email] = response;
              this._changeDetectorRef.detectChanges();
            })
          );
          observables.push(observable);
        });
      
        return forkJoin(observables);
      }

      startChatWithUser(user) {
        this._chatService.resetMessages()
        this._chatService.removeChannel()
        //this.subscribeToOtherUser(user)
        
        const channelId = ChatService.createChannel(this.connectedUser.email, user.email);
        this._chatService.refreshChannel(channelId);
        this.receiver = user.email;
        this.selectUser(user)
        
        this._chatService.chatListByChannel(channelId).pipe(
            switchMap(response => {
              this.filteredMessages = response;
              response.forEach(message => {
                this._chatService.pushMessage(message);
                this._changeDetectorRef.detectChanges()
              });
              this._changeDetectorRef.detectChanges()
              return this._chatService.getMessages();
            })
          ).subscribe(messages => {
            // Update your component's messages with the received messages
            
          });
        
        localStorage.setItem("channelChats",channelId)
        localStorage.setItem("receiver",this.receiver)
        this.highlightedUsers = this.highlightedUsers.filter(u => u !== user.email);
        localStorage.setItem("idSelectedUser", user.idUser)
        //this.subscribeToOtherUser(user);
        this._chatService.sendReadReceipt(channelId, this.username, this.receiver);
        this._changeDetectorRef.detectChanges();
        //this.getAllMessages()
        
    }
    filterMessages() {
        this.filteredMessages = this._chatService.filterMessages(this.channel);
      
      }
    selectUser(user: User) {
    
        // Emit an event or call a method to pass the selected user to the conversation component
        this._chatService.setSelectedUser(user);
        this._changeDetectorRef.detectChanges();
      }
      subscribeToOtherUsers(users, username) {
        users.forEach(user => this.subscribeToOtherUser(user));
    }
    subscribeToOtherUser(otherUser): string {
      const channelId = ChatService.createChannel(this.connectedUser.email, otherUser.email);
      this.stompService.watch(`/channel/chat/${channelId}`).subscribe(res => {
          const data: Message = JSON.parse(res.body); 
          this._chatService.pushMessage(data);
          this.getLastMessage()
          this.userListBySender2()
          .pipe(
            switchMap(() => this.getLastMessage())
          )
          .subscribe(() => {
            // All messages have been retrieved
          });
          this._changeDetectorRef.detectChanges()
          if (data.channel !== this.channel) {
              this.showNotification(data);
          } else {
              // send read receipt for the channel
              this._chatService.sendReadReceipt(this.channel, this.username, this.receiver);
          }
      });

      return channelId;
  }

    showNotification(message: Message) {
        const snackBarRef = this.snackBar.open('New message from ' + message.sender, 'Show', { duration: 3000 });
        this.highlightedUsers.push(message.sender);
        snackBarRef.onAction().subscribe(() => {
            this.receiver = message.sender;
            this.channel = ChatService.createChannel(this.username, message.sender);
            this._chatService.refreshChannel(this.channel);
        });
    }
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
    connectedUsers: any[] = [];

  
}

