import { Component, ElementRef, ChangeDetectorRef, HostBinding, HostListener, NgZone, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation, Input } from '@angular/core';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { Chat } from 'app/layout/common/quick-chat/quick-chat.types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RxStompService } from '@stomp/ng2-stompjs';
import { UserService } from 'app/modules/admin/customdash/user/user.service';
import { ChatService } from 'app/modules/admin/apps/chat/chat.service';
import { User } from 'app/modules/admin/customdash/user/User';
import { Message, Profile } from 'app/modules/admin/apps/chat/chat.types';
import { BehaviorSubject, Observable, forkJoin, Subscription, merge } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'quick-chat',
  templateUrl: './quick-chat.component.html',
  styleUrls: ['./quick-chat.component.scss'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'quickChat'
})
export class QuickChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageInput') messageInput: ElementRef;
  chat: Chat;
  chats: Chat[];
  users: User[] = [];
  opened: boolean = false;
  selectedChat: Chat;
  private _scrollStrategy: ScrollStrategy = this._scrollStrategyOptions.block();
  private _overlay: HTMLElement;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  selectedUserChat: User = new User();
  profile: Profile;
  selectedUsers: User[] = []
  lastMessages: { [email: string]: Message } = {};
  senders: User[] = [];
  filteredUsers: User[] = [];
  connectedUser: User;
  lastMessageContent$: Observable<string>;
  @Input() selectedUser: User;
  username: string;
  highlightedUsers: Array<string> = [];
  newConnectedUsers: Array<string> = [];
  channel: string;
  receiver: string;
  topicSubscription;
  filteredMessages: Array<Message> = [];
  newMessage: string;
  /**
   * Constructor
   */
  constructor(
    private _chatService: ChatService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _userService: UserService,
    private stompService: RxStompService,
    private snackBar: MatSnackBar,
    private _elementRef: ElementRef,
    private _renderer2: Renderer2,
    private _ngZone: NgZone,
    private _quickChatService: QuickChatService,
    private _scrollStrategyOptions: ScrollStrategyOptions
  ) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Decorated methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Host binding for component classes
   */
  @HostBinding('class') get classList(): any {
    return {
      'quick-chat-opened': this.opened
    };
  }

  /**
   * Resize on 'input' and 'ngModelChange' events
   *
   * @private
   */
  @HostListener('input')
  @HostListener('ngModelChange')
  private _resizeMessageInput(): void {
    // This doesn't need to trigger Angular's change detection by itself
    this._ngZone.runOutsideAngular(() => {

      setTimeout(() => {

        // Set the height to 'auto' so we can correctly read the scrollHeight
        this.messageInput.nativeElement.style.height = 'auto';

        // Get the scrollHeight and subtract the vertical padding
        this.messageInput.nativeElement.style.height = `${this.messageInput.nativeElement.scrollHeight}px`;
      });
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.selectedUsers.push(this.selectedUser);
    this.username = localStorage.getItem("email");
    this.connectedUser = new User();
    this.getUserList();
    this.getConnectedUser();
    this.getselecteduser();
    this.userListBySender()
    .pipe(
      switchMap(() => this.getLastMessage())
    )
    .subscribe(() => {
      // All messages have been retrieved
      
    });
    
    
    this._chatService.getMessages().subscribe(messages => {
      this.filteredMessages = this._chatService.filterMessages(this.channel);
      this._changeDetectorRef.detectChanges()
    });

    this.sendReadReceipt();
    // Chat
    this._quickChatService.chat$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((chat: Chat) => {
        this.chat = chat;
      });

    // Chats
    this._quickChatService.chats$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((chats: Chat[]) => {
        this.chats = chats;
      });

    // Selected chat
    this._quickChatService.chat$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((chat: Chat) => {
        this.selectedChat = chat;
      });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Open the panel
   */
  open(): void {
    // Return if the panel has already opened
    if (this.opened) {
      return;
    }

    // Open the panel
    this._toggleOpened(true);
  }

  /**
   * Close the panel
   */
  close(): void {
    // Return if the panel has already closed
    if (!this.opened) {
      return;
    }

    // Close the panel
    this._toggleOpened(false);
  }

  /**
   * Toggle the panel
   */
  toggle(): void {
    if (this.opened) {
      this.close();
    }
    else {
      this.open();
    }
  }

  /**
   * Select the chat
   *
   * @param id
   */
  selectChat(id: string): void {
    // Open the panel
    this._toggleOpened(true);

    // Get the chat data
    this._quickChatService.getChatById(id).subscribe();
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Show the backdrop
   *
   * @private
   */
  private _showOverlay(): void {
    // Try hiding the overlay in case there is one already opened
    this._hideOverlay();

    // Create the backdrop element
    this._overlay = this._renderer2.createElement('div');

    // Return if overlay couldn't be create for some reason
    if (!this._overlay) {
      return;
    }

    // Add a class to the backdrop element
    this._overlay.classList.add('quick-chat-overlay');

    // Append the backdrop to the parent of the panel
    this._renderer2.appendChild(this._elementRef.nativeElement.parentElement, this._overlay);

    // Enable block scroll strategy
    this._scrollStrategy.enable();

    // Add an event listener to the overlay
    this._overlay.addEventListener('click', () => {
      this.close();
    });
  }

  /**
   * Hide the backdrop
   *
   * @private
   */
  private _hideOverlay(): void {
    if (!this._overlay) {
      return;
    }

    // If the backdrop still exists...
    if (this._overlay) {
      // Remove the backdrop
      this._overlay.parentNode.removeChild(this._overlay);
      this._overlay = null;
    }

    // Disable block scroll strategy
    this._scrollStrategy.disable();
  }

  /**
   * Open/close the panel
   *
   * @param open
   * @private
   */
  private _toggleOpened(open: boolean): void {
    // Set the opened
    this.opened = open;

    // If the panel opens, show the overlay
    if (open) {
      this._showOverlay();
    }
    // Otherwise, hide the overlay
    else {
      this._hideOverlay();
    }
  }
  @HostListener('window:load', [])
  sendReadReceipt() {
    if (this.channel != null && this.receiver != null) {
      this._chatService.sendReadReceipt(this.channel, this.username, this.receiver);
    }
  }
  sendMessage() {
    if (this.newMessage) {
      this.stompService.publish({
        destination: '/app/messages', body:
          JSON.stringify({
            'channel': this.channel,
            'sender': this.username,
            'receiver': localStorage.getItem("receiver"),
            'content': this.newMessage
          })


      });
      this.newMessage = '';



      this._changeDetectorRef.detectChanges()

    }
  }


  getUserList() {
    this._userService.UserList().subscribe(
      data=>{
          this.users=data;
          this.filteredUsers = this.users.filter(user => user.email !== localStorage.getItem("email"));
          this.connectedUser = this.users.filter(user => user.email === localStorage.getItem("email"))[0];
          this._changeDetectorRef.markForCheck()
      }
    )
    this.filteredUsers = this.users.filter(user => user.email !== localStorage.getItem("email"));
    this._changeDetectorRef.markForCheck()

  }
  getConnectedUser() {
   
    this._changeDetectorRef.markForCheck()



  }
  getselecteduser() {
    this._chatService.getUser().subscribe((user: User) => {
      // Update the profile information using the selected user
      this.selectedUserChat = user;
     
      this._changeDetectorRef.detectChanges()
    });
  }
  checkIfUserBelongsToSenders(): boolean {
    if (this.selectedUserChat && this.senders) {
      return this.senders.some(user => user.idUser === this.selectedUserChat.idUser);
    }
    return false;
  }
  userListBySender(): Observable<any> {
    return this._chatService.userListByReceiver(localStorage.getItem("email")).pipe(
      tap(response => {
        this.senders = response;


        //this.subscribeToOtherUsers(response, this.connectedUser.email);
        this._changeDetectorRef.detectChanges()
      })
    );
  }
  userListBySender2(): Observable<any> {
    return this._chatService.userListByReceiver(localStorage.getItem("email")).pipe(
      tap(response => {
        this.senders = response;




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
    this.selectedUserChat = user;

    this._toggleOpened(true);
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

    localStorage.setItem("channelChats", channelId)
    localStorage.setItem("receiver", this.receiver)
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
    this.channel = channelId;
    this.stompService.watch(`/channel/chat/${channelId}`).subscribe(res => {
      const data: Message = JSON.parse(res.body);
      this._chatService.pushMessage(data);
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
}
