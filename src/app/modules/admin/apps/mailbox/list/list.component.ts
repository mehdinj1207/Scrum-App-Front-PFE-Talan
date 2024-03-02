import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MailboxService } from 'app/modules/admin/apps/mailbox/mailbox.service';
import { MailboxComponent } from 'app/modules/admin/apps/mailbox/mailbox.component';
import { Feedback, FeedbackReceivers, Mail, MailCategory } from 'app/modules/admin/apps/mailbox/mailbox.types';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MailboxComposeComponent } from '../compose/compose.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'mailbox-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None
})
export class MailboxListComponent implements OnInit, OnDestroy {
    @ViewChild('mailList') mailList: ElementRef;
    feedbacksSent: Feedback[] = [];
    feedbackReceived: Feedback[] = [];
    category: MailCategory;
    mails: Mail[];
    mailsLoading: boolean = false;
    pagination: any;
    selectedMail: Mail;
    feedbacks: Feedback[] = [];
    filter: string = "Received";
    filteredFeedbacks: Feedback[] = [];
    dataReceived:Feedback[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    feedbacksNumber:number=0;


    /**
     * Constructor
     */
    constructor(
        public mailboxComponent: MailboxComponent,
        private _mailboxService: MailboxService,
        private changeDetectorRef: ChangeDetectorRef,
        private location: Location,
        private _router: Router,
        private _matDialog: MatDialog,
        private _activatedRoute: ActivatedRoute,
        private sanitizer: DomSanitizer
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this.getSentFeedbacks();
        this.getFeedbackReceiversObjects();
        this.filterFeedbacks("Received");
        this.filteredFeedbacks = this.filteredFeedbacks.sort((a, b) => {
            const dateA = new Date(a.dateFeedback);
            const dateB = new Date(b.dateFeedback);
            return dateB.getTime() - dateA.getTime();
        });

        this.changeDetectorRef.markForCheck();
        // Category
        this._mailboxService.category$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((category: MailCategory) => {
                this.category = category;
            });
        // Mails
        this._mailboxService.mails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((mails: Mail[]) => {
                this.mails = mails;
            });
        // Mails loading
        this._mailboxService.mailsLoading$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((mailsLoading: boolean) => {
                this.mailsLoading = mailsLoading;

                // If the mail list element is available & the mails are loaded...
                if (this.mailList && !mailsLoading) {
                    // Reset the mail list element scroll position to top
                    this.mailList.nativeElement.scrollTo(0, 0);
                }
            });

        // Selected mail
        this._mailboxService.mail$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((mail: Mail) => {
                this.selectedMail = mail;
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
    setFeedbackIsRead(idFeedback, isRead:boolean): void{
        this.filteredFeedbacks.filter(feedback=> feedback.idFeedback==idFeedback)[0].isRead=isRead;
    }
    setFeedbackIsUrgent(idFeedback, isUrgent:boolean): void{
        this.filteredFeedbacks.filter(feedback=> feedback.idFeedback==idFeedback)[0].urgent=isUrgent;
        this.feedbacksSent.filter(feedback=> feedback.idFeedback==idFeedback)[0].urgent=isUrgent;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On mail selected
     *
     * @param mail
     */
    onMailSelected(feedback: Feedback): void {
        this._router.navigate(['./', feedback.idFeedback], { relativeTo: this._activatedRoute });
        if(!feedback.isRead){
            feedback.isRead=true;
            this._mailboxService.setFeedbackIsRead(feedback.idFeedback,1).subscribe(
                data=>{}
            )
        }
        this._mailboxService.setSelectedFeedback(feedback);
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
    getSentFeedbacks() {
        this.feedbacksSent=[];
        this.feedbacks=[];
        this._mailboxService.getSentFeedbacks().subscribe(
            (data: Feedback[]) => {
                this.feedbacksSent = data;
                for (let i = 0; i < this.feedbacksSent.length; i++) {
                    this.feedbacksSent[i].sendOrReceived = false;
                    this.feedbacksSent[i].isRead = true;
                    this.feedbacksSent[i].isImportant=false;
                    this.feedbacks.push(this.feedbacksSent[i]);
                    this.changeDetectorRef.markForCheck();
                }
                this.feedbacksSent = this.feedbacksSent.sort((a, b) => {
                    const dateA = new Date(a.dateFeedback);
                    const dateB = new Date(b.dateFeedback);
                    return dateB.getTime() - dateA.getTime();
                });
                this.changeDetectorRef.markForCheck();
            }
        )
    }

    getFeedbackReceiversObjects() {
        this.dataReceived=[];
        this._mailboxService.getFeedbackReceiversObjects().subscribe(
            
            (data: FeedbackReceivers[]) => {
                data.forEach(feedbackReceiver => {
                    feedbackReceiver.feedback.isRead=feedbackReceiver.read;
                    feedbackReceiver.feedback.isImportant=feedbackReceiver.important;
                    feedbackReceiver.feedback.sendOrReceived = true;
                    this.dataReceived.push(feedbackReceiver.feedback);
                    this.feedbacks.push(feedbackReceiver.feedback);
                    this.changeDetectorRef.markForCheck();
                })
                this.dataReceived = this.dataReceived.sort((a, b) => {
                    const dateA = new Date(a.dateFeedback);
                    const dateB = new Date(b.dateFeedback);
                    return dateB.getTime() - dateA.getTime();
                });
                this.feedbacks = this.feedbacks.sort((a, b) => {
                    const dateA = new Date(a.dateFeedback);
                    const dateB = new Date(b.dateFeedback);
                    return dateB.getTime() - dateA.getTime();
                });
                this.changeDetectorRef.markForCheck();
            })


    }

    openComposeDialog(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(MailboxComposeComponent);

        dialogRef.afterClosed()
            .subscribe((result) => {
                console.log('Compose dialog was closed!');
            });
    }
    parseHTML(content: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(content);
    }
    filterFeedbacks(filter: string) {
        this.filter = filter;
        if (filter == "Received") {
            this.filteredFeedbacks = this.dataReceived.sort((a, b) => {
                const dateA = new Date(a.dateFeedback);
                const dateB = new Date(b.dateFeedback);
                return dateB.getTime() - dateA.getTime();
            });
            this.changeDetectorRef.markForCheck();
        }
        if (filter == "Sent") {
            this.filteredFeedbacks = this.feedbacksSent.sort((a, b) => {
                const dateA = new Date(a.dateFeedback);
                const dateB = new Date(b.dateFeedback);
                return dateB.getTime() - dateA.getTime();
            });
            this.changeDetectorRef.markForCheck();
        } 
        if (filter == "All") {
            this.filteredFeedbacks = this.feedbacks.sort((a, b) => {
                return new Date(b.dateFeedback).getTime() - new Date(a.dateFeedback).getTime();
            });
            this.changeDetectorRef.markForCheck();
        }
        
    }
    removeFeedback(idFeedback){
        this.feedbacksSent=this.feedbacksSent.filter(feedback=> feedback.idFeedback!=idFeedback);
        this.feedbacks=this.feedbacks.filter(feedback=> feedback.idFeedback!=idFeedback);
        this.filteredFeedbacks=this.filteredFeedbacks.filter(feedback=> feedback.idFeedback!=idFeedback);
    }
}
