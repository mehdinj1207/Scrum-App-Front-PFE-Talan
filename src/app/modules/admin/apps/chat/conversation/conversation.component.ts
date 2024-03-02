import { ChangeDetectionStrategy, ChangeDetectorRef,Input, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Chat, ChatMessageDto, Message } from 'app/modules/admin/apps/chat/chat.types';
import { ChatService } from 'app/modules/admin/apps/chat/chat.service';
import { WebSocketAPI } from '../WebSocketAPI';
import { RxStompService } from '@stomp/ng2-stompjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'app/modules/admin/customdash/user/user.service';
import { User } from 'app/modules/admin/customdash/user/User';
@Component({
    selector       : 'chat-conversation',
    templateUrl    : './conversation.component.html',
    styleUrls: ['./conversation.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationComponent implements OnInit, OnDestroy
{
    @ViewChild('messageInput') messageInput: ElementRef;
    chat: Chat;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    webSocketAPI: WebSocketAPI;
    greeting: any;
    name: string;
    webSocketEndPoint: string = 'http://localhost:8090/ws';
    topic: string = "/topic/greetings";
    stompClient: any;
    receiver:String;
    profile:User=new User();
    lastMessage:Message;

    /**
     * Constructor
     */
     filteredMessages: Array<Message> = [];
  newMessage: string;
   channel: string;
   oumaimaMessages:Message[]=[]
   highlightedUsers: Array<string> = [];
  idSelectedUser:number;
  username: string;
  user: User=new User()

  constructor(private stompService: RxStompService,
        private _changeDetectorRef: ChangeDetectorRef,
        public _chatService: ChatService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _ngZone: NgZone,
        private snackBar: MatSnackBar,
        private _userService: UserService
        
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Decorated methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resize on 'input' and 'ngModelChange' events
     *
     * @private
     */
    

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {//this._chatService.openWebSocket();  
        // Chat
        this.updateProfile();
        this.username=localStorage.getItem("email");
        this.idSelectedUser=+localStorage.getItem("idSelectedUser")
        this._chatService.getChannel().subscribe(channel => {
          this.channel = channel;
          this._changeDetectorRef.detectChanges()
          
            this.filteredMessages = this._chatService.filterMessages(this.channel);
        });
        
        this.receiver=localStorage.getItem("receiver");
        // ...
      
        this._chatService.getMessages().subscribe(messages => {
          this.filteredMessages = this._chatService.filterMessages(this.channel);
          this._changeDetectorRef.detectChanges()
        });  
        
        this.sendReadReceipt();
        this._chatService.chat$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chat: Chat) => {
                this.chat = chat;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            this.getUser()
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode if the given breakpoint is active
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                }
                else
                {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            //websocket ichat
            
                      
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
       // this._chatService.closeWebSocket();
    }
    @HostListener('window:load', [])
    sendReadReceipt() {
        if (this.channel != null && this.receiver != null) {
            this._chatService.sendReadReceipt(this.channel, this.username,this.receiver);
        }
    }
//websocket ichat
sendMessage() {
    if (this.newMessage) {
      this.stompService.publish({
        destination: '/app/messages', body:
          JSON.stringify({
            'channel': this.channel,
            'sender': this.username,
            'receiver':localStorage.getItem("receiver"),
            'content': this.newMessage
          })
          
          
      });
      this.newMessage = '';
     
      this._chatService.setSelectedMessage(this.lastMessage)
      
      this._changeDetectorRef.detectChanges()
      
    }
  }

  filterMessages() {
    this.filteredMessages = this._chatService.filterMessages(this.channel);
  
  }
updateProfile(){
  this._chatService.getSelectedUser().subscribe((user: User) => {
    // Update the profile information using the selected user
    this.profile=user;
    this._changeDetectorRef.markForCheck();
  });
}
  
  
  
//websocket ichat

   /* websocket te5dem sendMessage(sendForm: NgForm) {
        const chatMessageDto = new ChatMessageDto(sendForm.value.user, sendForm.value.message);
        this._chatService.sendMessage(chatMessageDto);
        sendForm.controls.message.reset();
      }*/
    
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the contact info
     */
    openContactInfo(email:string): void
    {
        // Open the drawer
        this.drawerOpened = true;
        // Mark for check
        this._changeDetectorRef.markForCheck();
        
    localStorage.setItem("emailProfile",email)

    }

    /**
     * Reset the chat
     */
    resetChat(): void
    {
        this._chatService.resetChat();

        // Close the contact info in case it's opened
        this.drawerOpened = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle mute notifications 
     */
    toggleMuteNotifications(): void
    {
        // Toggle the muted
        this.chat.muted = !this.chat.muted;

        // Update the chat on the server
        this._chatService.updateChat(this.chat.id, this.chat).subscribe();
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
    showNotification(message: Message) {
      const snackBarRef = this.snackBar.open('New message from ' + message.sender, 'Show', { duration: 3000 });
      this.highlightedUsers.push(message.sender);
      snackBarRef.onAction().subscribe(() => {
          this.receiver = message.sender;
          this.channel = ChatService.createChannel(this.username, message.sender);
          this._chatService.refreshChannel(this.channel);
      });
  }
  getUser(){
    this._userService.retrieveUser(this.idSelectedUser)
        .subscribe((data) => {

            // Store the data
            this.user = data;
            this._changeDetectorRef.markForCheck();
        });
    
}
}
