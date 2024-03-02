import { Component, ChangeDetectorRef, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatButton } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MailboxService } from 'app/modules/admin/apps/mailbox/mailbox.service';
import { Feedback, Mail, MailFolder, MailLabel } from 'app/modules/admin/apps/mailbox/mailbox.types';
import { labelColorDefs } from 'app/modules/admin/apps/mailbox/mailbox.constants';
import { User } from 'app/modules/admin/customdash/user/User';
import { MailboxListComponent } from '../list/list.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'mailbox-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MailboxDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('infoDetailsPanelOrigin') private _infoDetailsPanelOrigin: MatButton;
    @ViewChild('infoDetailsPanel') private _infoDetailsPanel: TemplateRef<any>;
    folders: MailFolder[];
    labelColors: any;
    labels: MailLabel[];
    mail: Mail;
    replyFormActive: boolean = false;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    feedback: Feedback = new Feedback();
    feedbackselected: boolean = false;
    myEmail: string = localStorage.getItem("email");
    response: string = "";
    ananymousAvatar: string = "../../../../../../assets/images/apps/contacts/ananymous.jpg";
    idCurrentUser: number = +localStorage.getItem("idCurrentUser");
    feedbackReply: Feedback = new Feedback();
    replyOnFeedback: Feedback
    receivers: User[] = []
    receiversOfReply: User[] = []
    disableDelete:boolean=false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _elementRef: ElementRef,
        private _mailboxService: MailboxService,
        private _overlay: Overlay,
        private _router: Router,
        private _viewContainerRef: ViewContainerRef,
        private _changeDetectorRef: ChangeDetectorRef,
        private mailboxListComponent: MailboxListComponent,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the label colors
        this.labelColors = labelColorDefs;
        this.getFeedback();
        // Folders
        this._mailboxService.folders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((folders: MailFolder[]) => {
                this.folders = folders;
            });

        // Labels
        this._mailboxService.labels$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((labels: MailLabel[]) => {
                this.labels = labels;
            });

        // Mail
        this._mailboxService.mail$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((mail: Mail) => {
                this.mail = mail;
            });

        // Selected mail changed
        this._mailboxService.selectedMailChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {

                // De-activate the reply form
                this.replyFormActive = false;
            });
    }
    getFeedback() {
        this._mailboxService.getSelectedFeedback().subscribe(
            data => {
                this.feedback = data;
                this.feedbackselected = true;
                this.replyOnFeedback = this.feedback.replyOnFeedback;
                this._mailboxService.getFeedbackReceivers(this.feedback.idFeedback).subscribe(
                    data => {
                        this.receivers = data;
                        this._changeDetectorRef.markForCheck();
                    }
                )
                this._mailboxService.getRepliesNumber(this.feedback.idFeedback).subscribe(
                    data=>{
                        if(data==0){
                            this.disableDelete=false;
                        }
                        else{
                            this.disableDelete=true;
                        }
                    }
                )
                if (this.replyOnFeedback != null) {
                    this._mailboxService.getFeedbackReceivers(this.replyOnFeedback.idFeedback).subscribe(
                        data => {
                            this.receiversOfReply = data;
                            this._changeDetectorRef.markForCheck();
                        }
                    )
                }
                if (this.feedback.isRead == false) {
                    this._mailboxService.setFeedbackIsRead(this.feedback.idFeedback, 1).subscribe(data => {
                        this.mailboxListComponent.setFeedbackIsRead(this.feedback.idFeedback, true)
                    });
                }
                this._changeDetectorRef.markForCheck();
            }
        )


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
     * Get the current folder
     */
    getCurrentFolder(): any {
        return this._activatedRoute.snapshot.paramMap.get('folder');
    }

    /**
     * Toggle star
     */
    toggleStar(): void {
        if (this.feedback.isImportant == false) {
            this._mailboxService.setFeedbackIsImportant(this.feedback.idFeedback, 1).subscribe(data => {
                this.mailboxListComponent.setFeedbackIsRead(this.feedback.idFeedback, true)
            });
        }else{
            this._mailboxService.setFeedbackIsImportant(this.feedback.idFeedback, 0).subscribe(data => {
                this.mailboxListComponent.setFeedbackIsRead(this.feedback.idFeedback, true)
            });
        }

        this.feedback.isImportant = !this.feedback.isImportant

    }

    /**
     * Toggle unread
     *
     * @param unread
     */
    toggleUnread(unread: boolean): void {
        this.feedback.isRead = false;
        this._mailboxService.setFeedbackIsRead(this.feedback.idFeedback, 0).subscribe(data => {
            this.mailboxListComponent.setFeedbackIsRead(this.feedback.idFeedback, false)
        });
    }
    toggleImportant(): void
    {if (this.feedback.urgent == false) {
        this._mailboxService.setFeedbackIsUrgent(this.feedback.idFeedback, 1).subscribe(data => {
            this.mailboxListComponent.setFeedbackIsUrgent(this.feedback.idFeedback, true)
        });
    }else{
        this._mailboxService.setFeedbackIsUrgent(this.feedback.idFeedback, 0).subscribe(data => {
            this.mailboxListComponent.setFeedbackIsUrgent(this.feedback.idFeedback, false)
        });
    }
        // Update the mail object
        this.feedback.urgent = !this.feedback.urgent;
    }

    /**
     * Reply
     */
    reply(): void {
        // Activate the reply form
        this.replyFormActive = true;

        // Scroll to the bottom of the details pane
        setTimeout(() => {
            this._elementRef.nativeElement.scrollTop = this._elementRef.nativeElement.scrollHeight;
        });
    }

    /**
     * Forward
     */
    forward(): void {
        // Activate the reply form
        this.replyFormActive = true;

        // Scroll to the bottom of the details pane
        setTimeout(() => {
            this._elementRef.nativeElement.scrollTop = this._elementRef.nativeElement.scrollHeight;
        });
    }

    /**
     * Discard
     */
    discard(): void {
        // Deactivate the reply form
        this.replyFormActive = false;
    }

    /**
     * Send
     */
    send(): void {
        // Deactivate the reply form
        this.replyFormActive = false;
        this._mailboxService.addReplyToFeedback(this.feedback.idFeedback, this.idCurrentUser, this.feedbackReply).subscribe(
            (data: Feedback) => {
                window.location.reload();
            }
        )

    }
    deleteFeedback(){
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Feedback',
            message: 'Are you sure you want to delete this feedback? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._mailboxService.deleteFeedback(this.feedback.idFeedback).subscribe(
                    data=>{
                        this.feedbackselected=null
                        this.mailboxListComponent.removeFeedback(this.feedback.idFeedback);
                        this._router.navigate(['../../'], { relativeTo: this._activatedRoute })
                    }
                )
            }
        })
        this._changeDetectorRef.markForCheck();
        
    }

    /**
     * Open info details panel
     */
    openInfoDetailsPanel(): void {
        // Create the overlay
        this._overlayRef = this._overlay.create({
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._infoDetailsPanelOrigin._elementRef.nativeElement)
                .withFlexibleDimensions(true)
                .withViewportMargin(16)
                .withLockedPosition(true)
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top'
                    },
                    {
                        originX: 'start',
                        originY: 'top',
                        overlayX: 'start',
                        overlayY: 'bottom'
                    },
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top'
                    },
                    {
                        originX: 'end',
                        originY: 'top',
                        overlayX: 'end',
                        overlayY: 'bottom'
                    }
                ])
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(this._infoDetailsPanel, this._viewContainerRef);

        // Attach the portal to the overlay
        this._overlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._overlayRef.backdropClick().subscribe(() => {

            // If overlay exists and attached...
            if (this._overlayRef && this._overlayRef.hasAttached()) {
                // Detach it
                this._overlayRef.detach();
            }

            // If template portal exists and attached...
            if (templatePortal && templatePortal.isAttached) {
                // Detach it
                templatePortal.detach();
            }
        });
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
}
