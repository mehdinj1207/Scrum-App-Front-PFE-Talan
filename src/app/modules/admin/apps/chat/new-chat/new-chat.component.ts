import { ChangeDetectionStrategy, Component, Input, OnDestroy, HostListener, EventEmitter, OnInit, ViewEncapsulation, ChangeDetectorRef, Output } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Contact, Message } from 'app/modules/admin/apps/chat/chat.types';
import { ChatService } from 'app/modules/admin/apps/chat/chat.service';
import { UserService } from 'app/modules/admin/customdash/user/user.service';
import { User } from 'app/modules/admin/customdash/user/User';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RxStompService } from '@stomp/ng2-stompjs';
@Component({
    selector       : 'chat-new-chat',
    templateUrl    : './new-chat.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewChatComponent implements OnInit, OnDestroy
{
    @Input() drawer: MatDrawer;
    contacts: Contact[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    filteredUsers:User[]=[];
    NEW_USER_LIFETIME: number = 1000 * 5;

   
    username: string;
    @Output() userSelected: EventEmitter<User> = new EventEmitter<User>();
    @Output()
    receiverUpdated = new EventEmitter<string>();
    senders:User[]=[];
    users: User[] = [];
    highlightedUsers: Array<string> = [];
    newConnectedUsers: Array<string> = [];
    channel: string;
    receiver: string;
    topicSubscription;
    filteredMessages: Array<Message> = [];
    /**
     * Constructor
     */
    constructor(private _chatService: ChatService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private stompService: RxStompService,
         private snackBar: MatSnackBar)
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
        this.username=localStorage.getItem("email");
        
        this.userListBySender()
    .pipe(
      switchMap(() => this.getUserList())
    )
    .subscribe((filteredUsers) => {
     
    });
        // Contacts
        this._chatService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: Contact[]) => {
                this.contacts = contacts;
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
    }
    userListBySender(): Observable<any> {
        return this._chatService.userListByReceiver(localStorage.getItem("email")).pipe(
          tap(response => {
            this.senders = response;
            this._changeDetectorRef.markForCheck();
          })
        );
      }
      getUserList() {
        return this._userService.data$.pipe(
          takeUntil(this._unsubscribeAll),
          tap((data) => {
            this.users = data;
            this._changeDetectorRef.markForCheck();
            this.initUserEvents();
          }),
          map(() => {
            this.filteredUsers = this.users.filter(user => user.email !== localStorage.getItem("email"));
            this.filteredUsers = this.filteredUsers.filter(user => {
              return !this.senders.some(sender => sender.email === user.email);
            });
            return this.filteredUsers; // Return the filtered users
          })
        );
      }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    @HostListener('window:load', [])
    sendReadReceipt() {
        if (this.channel != null && this.receiver != null) {
            this._chatService.sendReadReceipt(this.channel, this.username,this.receiver);
        }
    }

    startChatWithUser(user) {
        const channelId = ChatService.createChannel(this.username, user.email);
        this._chatService.refreshChannel(channelId);
        this.receiver = user.email;
        this._chatService.setUser(user);
        this._changeDetectorRef.detectChanges();
        this._chatService.chatListByChannel(channelId).subscribe(response => { 
            this.filteredMessages = response;
      
              this.filteredMessages.forEach(message=>{
                  this._chatService.pushMessage(message);
                
              })
              //this.filterMessages();
            }
          );
        localStorage.setItem("channel",channelId)
        localStorage.setItem("receiver",this.receiver)
        this.highlightedUsers = this.highlightedUsers.filter(u => u !== user.email);
        this.receiverUpdated.emit(user.email);
        this.userSelected.emit(user);
        localStorage.setItem("idSelectedUser", user.idUser)
        //this.subscribeToOtherUser(user);
        this._chatService.sendReadReceipt(channelId, this.username, this.receiver);
        this.drawer.close();
        this._changeDetectorRef.markForCheck()
        //this.getAllMessages()
        
    }
   
    initUserEvents() {
        this.subscribeToOtherUsers(this.users, this.username);
        this._changeDetectorRef.markForCheck();
    }

    removeNewUserBackground(username) {
        this.newConnectedUsers = this.newConnectedUsers.filter(u => u !== username);
    }

    subscribeToOtherUsers(users, username) {
        const filteredUsers: Array<any> = users.filter(user => username !== user.email);
        filteredUsers.forEach(user => this.subscribeToOtherUser(user));
    }

    subscribeToOtherUser(otherUser): string {
        const channelId = ChatService.createChannel(this.username, otherUser.email);
        
        this.stompService.watch(`/channel/chat/${channelId}`).subscribe(res => {
            const data: Message = JSON.parse(res.body); 
            this._chatService.pushMessage(data);
            
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
            this.receiverUpdated.emit(message.sender);
            this.channel = ChatService.createChannel(this.username, message.sender);
            this._chatService.refreshChannel(this.channel);
        });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}

