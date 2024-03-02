import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import momentPlugin from '@fullcalendar/moment';
import rrulePlugin from '@fullcalendar/rrule';
import timeGridPlugin from '@fullcalendar/timegrid';
import { clone, cloneDeep, isEqual, omit } from 'lodash-es';
import * as moment from 'moment';
import { RRule } from 'rrule';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { CalendarRecurrenceComponent } from 'app/modules/admin/apps/calendar/recurrence/recurrence.component';
import { CalendarService } from 'app/modules/admin/apps/calendar/calendar.service';
import { Calendar, CalendarDrawerMode, CalendarEvent, CalendarEventEditMode, CalendarEventPanelMode, CalendarSettings } from 'app/modules/admin/apps/calendar/calendar.types';
import { MeetService } from '../../customdash/meet/meet.service';
import { Project, Ressource } from '../../customdash/project/classes/project.types';
import { Ceremony, Meet } from '../../customdash/meet/meet.types';
import { calendarColors } from './sidebar/calendar-colors';
import { ProjectService } from '../../customdash/project/services/project.service';
import { User } from '../../customdash/user/User';
import { FuseConfirmationService } from '@fuse/services/confirmation';
@Component({
    selector: 'calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('eventPanel') private _eventPanel: TemplateRef<any>;
    @ViewChild('fullCalendar') private _fullCalendar: FullCalendarComponent;
    @ViewChild('drawer') private _drawer: MatDrawer;
    meets: Meet[];
    meet: Meet;
    projects: Project[]=[];
    calendars: Calendar[];
    calendarPlugins: any[] = [dayGridPlugin, interactionPlugin, listPlugin, momentPlugin, rrulePlugin, timeGridPlugin];
    drawerMode: CalendarDrawerMode = 'side';
    drawerOpened: boolean = true;
    event: CalendarEvent;
    eventEditMode: CalendarEventEditMode = 'single';
    eventForm: FormGroup;
    eventTimeFormat: any;
    events: CalendarEvent[] = [];
    panelMode: CalendarEventPanelMode = 'view';
    settings: CalendarSettings;
    idMeetUser:number=0;
    view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listYear' = 'dayGridMonth';
    views: any;
    viewTitle: string;
    private _eventPanelOverlayRef: OverlayRef;
    private _fullCalendarApi: FullCalendar;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    ceremonies: Ceremony[]=[];
    ceremonyId: number;
    participants: User[]=[];
    disableProject: boolean = false
    loop: boolean = true;
    idOld: number;
    loopUser: boolean = true;
    oldMail: string;
    email: string;
    users: User[] = [];
    userIds: number[] = [];
    lengthUsers: number = 0;
    sanitizedImageUrl: any = "../../../../../assets/images/apps/contacts/blank-profile-picture-973460__340-min.png";
    selectedMeet:Meet=new Meet();
    meetParticipations:User[]=[];
    lengthParticipations:number=0;
    lengthParticipation: number = 0;
    projectRessources:User[]=[];
    currentUserEmail:string="";
    idCurrentUser:number=0;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    /**
     * Constructor
     */
    constructor(
        private _calendarService: CalendarService,
        private _meetService: MeetService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: Document,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _overlay: Overlay,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _viewContainerRef: ViewContainerRef,
        private _projectService: ProjectService,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for event's recurrence status
     */
    get recurrenceStatus(): string {
        // Get the recurrence from event form
        const recurrence = this.eventForm.get('recurrence').value;

        // Return null, if there is no recurrence on the event
        if (!recurrence) {
            return null;
        }

        // Convert the recurrence rule to text
        let ruleText = RRule.fromString(recurrence).toText();
        ruleText = ruleText.charAt(0).toUpperCase() + ruleText.slice(1);

        // Return the rule text
        return ruleText;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.currentUserEmail=localStorage.getItem("email");
        this.idCurrentUser=+localStorage.getItem("idCurrentUser");
        this.getMeetsByUser();
        this.initializeEvenForm();
        this.getCalendars();
        this.getEvents();
        this.getSettings();
        this.getCeremonies();
        this.configureMedia();
        this.configureCalendarView();
        this.getProjects();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Get the full calendar API
        this._fullCalendarApi = this._fullCalendar.getApi();

        // Get the current view's title
        this.viewTitle = this._fullCalendarApi.view.title;

        // Get the view's current start and end dates, add/subtract
        // 60 days to create a ~150 days period to fetch the data for
        const viewStart = moment(this._fullCalendarApi.view.currentStart).subtract(60, 'days');
        const viewEnd = moment(this._fullCalendarApi.view.currentEnd).add(60, 'days');
        this._meetService.meetListByUser().subscribe(
            data => {
                this.meets = data;
                this._calendarService.getEvents(viewStart, viewEnd, this.meets, true).subscribe();
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Dispose the overlay
        if (this._eventPanelOverlayRef) {
            this._eventPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle Drawer
     */
    toggleDrawer(): void {
        // Toggle the drawer
        this._drawer.toggle();
    }

    /**
     * Open recurrence panel
     */
    openRecurrenceDialog(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(CalendarRecurrenceComponent, {
            panelClass: 'calendar-event-recurrence-dialog',
            data: {
                event: this.eventForm.value
            }
        });

        // After dialog closed
        dialogRef.afterClosed().subscribe((result) => {

            // Return if canceled
            if (!result || !result.recurrence) {
                return;
            }

            // Only update the recurrence if it actually changed
            if (this.eventForm.get('recurrence').value === result.recurrence) {
                return;
            }

            // If returned value is 'cleared'...
            if (result.recurrence === 'cleared') {
                // Clear the recurrence field if recurrence cleared
                this.eventForm.get('recurrence').setValue(null);
            }
            // Otherwise...
            else {
                // Update the recurrence field with the result
                this.eventForm.get('recurrence').setValue(result.recurrence);
            }
        });
    }

    /**
     * Change the event panel mode between view and edit
     * mode while setting the event edit mode
     *
     * @param panelMode
     * @param eventEditMode
     */
    changeEventPanelMode(panelMode: CalendarEventPanelMode, eventEditMode: CalendarEventEditMode = 'single'): void {
        // Set the panel mode
        this.panelMode = panelMode;

        // Set the event edit mode
        this.eventEditMode = eventEditMode;
        // Update the panel position
        setTimeout(() => {
            this._eventPanelOverlayRef.updatePosition();
        });
    }

    /**
     * Get calendar by id
     *
     * @param id
     */
    getCalendar(id): Calendar {
        if (!id) {
            return;
        }

        return this.calendars.find(calendar => calendar.id === id);
    }

    /**
     * Change the calendar view
     *
     * @param view
     */
    changeView(view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listYear'): void {
        // Store the view
        this.view = view;

        // If the FullCalendar API is available...
        if (this._fullCalendarApi) {
            // Set the view
            this._fullCalendarApi.changeView(view);

            // Update the view title
            this.viewTitle = this._fullCalendarApi.view.title;
        }
    }

    /**
     * Moves the calendar one stop back
     */
    previous(): void {
        // Go to previous stop
        this._fullCalendarApi.prev();

        // Update the view title
        this.viewTitle = this._fullCalendarApi.view.title;

        // Get the view's current start date
        const start = moment(this._fullCalendarApi.view.currentStart);

        // Prefetch past events
        this._calendarService.prefetchPastEvents(start).subscribe();

    }

    /**
     * Moves the calendar to the current date
     */
    today(): void {
        // Go to today
        this._fullCalendarApi.today();

        // Update the view title
        this.viewTitle = this._fullCalendarApi.view.title;
    }

    /**
     * Moves the calendar one stop forward
     */
    next(): void {
        // Go to next stop
        this._fullCalendarApi.next();

        // Update the view title
        this.viewTitle = this._fullCalendarApi.view.title;

        // Get the view's current end date
        const end = moment(this._fullCalendarApi.view.currentEnd);

        // Prefetch future events
        this._calendarService.prefetchFutureEvents(end).subscribe();


    }

    /**
     * On date click
     *
     * @param calendarEvent
     */
    onDateClick(calendarEvent): void {
        // Prepare the event
        const event = {
            id: null,
            calendarId: this.calendars[0].id,
            recurringEventId: null,
            isFirstInstance: false,
            title: '',
            description: '',
            start: moment(calendarEvent.date).startOf('day').toISOString(),
            end: moment(calendarEvent.date).endOf('day').toISOString(),
            duration: null,
            allDay: false,
            recurrence: null,
            range: {
                start: moment(calendarEvent.date).startOf('day').toISOString(),
                end: moment(calendarEvent.date).endOf('day').toISOString()
            }
        };
        this.idMeetUser=0;
        // Set the event
        this.event = event;

        // Set the el on calendarEvent for consistency
        calendarEvent.el = calendarEvent.dayEl;

        // Reset the form and fill the event
        this.eventForm.reset();
        this.eventForm.patchValue(event);

        // Open the event panel
        this._openEventPanel(calendarEvent);

        // Change the event panel mode
        this.changeEventPanelMode('add');
    }

    /**
     * On event click
     *
     * @param calendarEvent
     */
    onEventClick(calendarEvent): void {
        this.participants=[];
        // Find the event with the clicked event's id
        const event: any = cloneDeep(this.events.find(item => item.id === calendarEvent.event.id));
        
        this.selectedMeet=this.meets.filter(meet=> meet.idMeet==event.id)[0];
        this.idMeetUser=this.selectedMeet.user.idUser;
        this.getParticipantsByMeet(event.id);
        if(this.participants.length==0){
            this.getProjectRessources(this.selectedMeet.project.idProject)
        }
        // Set the event
        this.event = event;

        // Prepare the end value
        let end;

        // If this is a recurring event...
        if (event.recuringEventId) {
            // Calculate the end value using the duration
            end = moment(event.start).add(event.duration, 'minutes').toISOString();
        }
        // Otherwise...
        else {
            // Set the end value from the end
            end = event.end;
        }

        // Set the range on the event
        event.range = {
            start: event.start,
            end
        };

        // Reset the form and fill the event
        this.eventForm.reset();
        this.eventForm.patchValue(event);

        // Open the event panel
        this._openEventPanel(calendarEvent);
    }

    /**
     * On event render
     *
     * @param calendarEvent
     */
    onEventRender(calendarEvent): void {
        // Get event's calendar
        const calendar = this.calendars.find(item => item.id === calendarEvent.event.extendedProps.calendarId);

        // Return if the calendar doesn't exist...
        if (!calendar) {
            return;
        }

        // If current view is year list...
        if (this.view === 'listYear') {
            // Create a new 'fc-list-item-date' node
            const fcListItemDate1 = `<td class="fc-list-item-date">
                                            <span>
                                                <span>${moment(calendarEvent.event.start).format('D')}</span>
                                                <span>${moment(calendarEvent.event.start).format('MMM')}, ${moment(calendarEvent.event.start).format('ddd')}</span>
                                            </span>
                                        </td>`;

            // Insert the 'fc-list-item-date' into the calendar event element
            calendarEvent.el.insertAdjacentHTML('afterbegin', fcListItemDate1);

            // Set the color class of the event dot
            calendarEvent.el.getElementsByClassName('fc-event-dot')[0].classList.add(calendar.color);

            // Set the event's title to '(No title)' if event title is not available
            if (!calendarEvent.event.title) {
                calendarEvent.el.querySelector('.fc-list-item-title').innerText = '(No title)';
            }
        }
        // If current view is not month list...
        else {
            // Set the color class of the event
            calendarEvent.el.classList.add(calendar.color);

            // Set the event's title to '(No title)' if event title is not available
            if (!calendarEvent.event.title) {
                calendarEvent.el.querySelector('.fc-title').innerText = '(No title)';
            }
        }

        // Set the event's visibility
        calendarEvent.el.style.display = calendar.visible ? 'flex' : 'none';
    }

    /**
     * On calendar updated
     *
     * @param calendar
     */
    onCalendarUpdated(calendar): void {
        // Re-render the events
        this._fullCalendarApi.rerenderEvents();
    }

    /**
     * Add event
     */
    addEvent(): void {
        let meet: Meet = new Meet()
        // Get the clone of the event form value
        let newEvent = clone(this.eventForm.value);


        // If the event is a recurring event...
        if (newEvent.recurrence) {
            // Set the event duration
            newEvent.duration = moment(newEvent.range.end).diff(moment(newEvent.range.start), 'minutes');
        }

        // Modify the event before sending it to the server
        newEvent = omit(newEvent, ['range', 'recurringEventId']);
        meet.startDate = this.convertDateStringToDate(newEvent.start);
        meet.endDate = this.convertDateStringToDate(newEvent.end);
        meet.title = newEvent.title;
        if (newEvent.recurrence != null) {
            meet.repetition = newEvent.recurrence.toString();
        }
        meet.duration = newEvent.duration;
        meet.description = newEvent.description;
        meet.allDay = false;
        this._meetService.addMeet(meet, +newEvent.calendarId, this.eventForm.get('ceremonyId').value).subscribe(
            (data: Meet) => {
                this._meetService.addParticipantsForMeet(data.idMeet, this.users).subscribe(
                    data => {
                        this.getMeetsByUser();
                        this._closeEventPanel();
                        this.ngAfterViewInit();
                        window.location.reload();
                        
                    }
                )
            }
        );
    }
    convertDateStringToDate(dateString: string): Date {
        // Replace the "Z" at the end of the string with "+00:00" to match the ISO 8601 format
        const formattedDateString = dateString.replace("Z", "+00:00");
        return new Date(formattedDateString);
    }
    /**
     * Update the event
     */
    updateEvent(): void {
        // Get the clone of the event form value
        let event = clone(this.eventForm.value);
        const {
            range,
            ...eventWithoutRange
        } = event;

        this.selectedMeet.startDate = this.convertDateStringToDate(event.start);
        this.selectedMeet.endDate = this.convertDateStringToDate(event.end);
       
        this._meetService.updateMeet(this.selectedMeet.idMeet,this.selectedMeet.project.idProject, this.selectedMeet.ceremony.idCeremony,this.selectedMeet).subscribe(
            data=>{
                this._meetService.updateParticipantsForMeet(this.selectedMeet.idMeet, this.users).subscribe(
                    data=>{
                        this.getMeetsByUser();
                        window.location.reload();
                        this._closeEventPanel();
                        this.ngAfterViewInit();
                    }
                )
                
            }
        )
    }

    /**
     * Delete the given event
     *
     * @param event
     * @param mode
     */
    deleteEvent(event, mode: CalendarEventEditMode = 'single'): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Meet',
            message: 'Are you sure you want to delete this meet? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._meetService.deleteMeet(this.selectedMeet.idMeet).subscribe(
                    data => {
                        this.getMeetsByUser();
                        this._closeEventPanel();
                        this.ngAfterViewInit();
                    },
                    error => { console.log('Error deleting meet'); }
                );
            }
        })

        this._changeDetectorRef.markForCheck();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the event panel overlay
     *
     * @private
     */
    private _createEventPanelOverlay(positionStrategy): void {
        // Create the overlay
        this._eventPanelOverlayRef = this._overlay.create({
            panelClass: ['calendar-event-panel'],
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.reposition(),
            positionStrategy
        });

        // Detach the overlay from the portal on backdrop click
        this._eventPanelOverlayRef.backdropClick().subscribe(() => {
            this._closeEventPanel();
        });
    }

    /**
     * Open the event panel
     *
     * @private
     */
    private _openEventPanel(calendarEvent): void {
        const positionStrategy = this._overlay.position().flexibleConnectedTo(calendarEvent.el).withFlexibleDimensions(false).withPositions([
            {
                originX: 'end',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'top',
                offsetX: 8
            },
            {
                originX: 'start',
                originY: 'top',
                overlayX: 'end',
                overlayY: 'top',
                offsetX: -8
            },
            {
                originX: 'start',
                originY: 'bottom',
                overlayX: 'end',
                overlayY: 'bottom',
                offsetX: -8
            },
            {
                originX: 'end',
                originY: 'bottom',
                overlayX: 'start',
                overlayY: 'bottom',
                offsetX: 8
            }
        ]);

        // Create the overlay if it doesn't exist
        if (!this._eventPanelOverlayRef) {
            this._createEventPanelOverlay(positionStrategy);
        }
        // Otherwise, just update the position
        else {
            this._eventPanelOverlayRef.updatePositionStrategy(positionStrategy);
        }

        // Attach the portal to the overlay
        this._eventPanelOverlayRef.attach(new TemplatePortal(this._eventPanel, this._viewContainerRef));

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close the event panel
     *
     * @private
     */
    private _closeEventPanel(): void {

        // Detach the overlay from the portal
        this._eventPanelOverlayRef.detach();
        // Reset the panel and event edit modes
        this.panelMode = 'view';
        this.eventEditMode = 'single';
        this.users=[];
        this.participants=[];
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Update the recurrence rule based on the event if needed
     *
     * @private
     */
    private _updateRecurrenceRule(): void {
        // Get the event
        const event = this.eventForm.value;

        // Return if this is a non-recurring event
        if (!event.recurrence) {
            return;
        }

        // Parse the recurrence rule
        const parsedRules = {};
        event.recurrence.split(';').forEach((rule) => {

            // Split the rule
            const parsedRule = rule.split('=');

            // Add the rule to the parsed rules
            parsedRules[parsedRule[0]] = parsedRule[1];
        });

        // If there is a BYDAY rule, split that as well
        if (parsedRules['BYDAY']) {
            parsedRules['BYDAY'] = parsedRules['BYDAY'].split(',');
        }

        // Do not update the recurrence rule if ...
        // ... the frequency is DAILY,
        // ... the frequency is WEEKLY and BYDAY has multiple values,
        // ... the frequency is MONTHLY and there isn't a BYDAY rule,
        // ... the frequency is YEARLY,
        if (parsedRules['FREQ'] === 'DAILY' ||
            (parsedRules['FREQ'] === 'WEEKLY' && parsedRules['BYDAY'].length > 1) ||
            (parsedRules['FREQ'] === 'MONTHLY' && !parsedRules['BYDAY']) ||
            parsedRules['FREQ'] === 'YEARLY') {
            return;
        }

        // If the frequency is WEEKLY, update the BYDAY value with the new one
        if (parsedRules['FREQ'] === 'WEEKLY') {
            parsedRules['BYDAY'] = [moment(event.start).format('dd').toUpperCase()];
        }

        // If the frequency is MONTHLY, update the BYDAY value with the new one
        if (parsedRules['FREQ'] === 'MONTHLY') {
            // Calculate the weekday
            const weekday = moment(event.start).format('dd').toUpperCase();

            // Calculate the nthWeekday
            let nthWeekdayNo = 1;
            while (moment(event.start).isSame(moment(event.start).subtract(nthWeekdayNo, 'week'), 'month')) {
                nthWeekdayNo++;
            }

            // Set the BYDAY
            parsedRules['BYDAY'] = [nthWeekdayNo + weekday];
        }

        // Generate the rule string from the parsed rules
        const rules = [];
        Object.keys(parsedRules).forEach((key) => {
            rules.push(key + '=' + (Array.isArray(parsedRules[key]) ? parsedRules[key].join(',') : parsedRules[key]));
        });
        const rrule = rules.join(';');

        // Update the recurrence rule
        this.eventForm.get('recurrence').setValue(rrule);
    }

    /**
     * Update the end value based on the recurrence and duration
     *
     * @private
     */
    private _updateEndValue(): void {
        // Get the event recurrence
        const recurrence = this.eventForm.get('recurrence').value;

        // Return if this is a non-recurring event
        if (!recurrence) {
            return;
        }

        // Parse the recurrence rule
        const parsedRules = {};
        recurrence.split(';').forEach((rule) => {

            // Split the rule
            const parsedRule = rule.split('=');

            // Add the rule to the parsed rules
            parsedRules[parsedRule[0]] = parsedRule[1];
        });

        // If there is an UNTIL rule...
        if (parsedRules['UNTIL']) {
            // Use that to set the end date
            this.eventForm.get('end').setValue(parsedRules['UNTIL']);

            // Return
            return;
        }

        // If there is a COUNT rule...
        if (parsedRules['COUNT']) {
            // Generate the RRule string
            const rrule = 'DTSTART=' + moment(this.eventForm.get('start').value).utc().format('YYYYMMDD[T]HHmmss[Z]') + '\nRRULE:' + recurrence;

            // Use RRule string to generate dates
            const dates = RRule.fromString(rrule).all();

            // Get the last date from dates array and set that as the end date
            this.eventForm.get('end').setValue(moment(dates[dates.length - 1]).toISOString());

            // Return
            return;
        }

        // If there are no UNTIL or COUNT, set the end date to a fixed value
        this.eventForm.get('end').setValue(moment().year(9999).endOf('year').toISOString());
    }

    //Oumaima
    initializeEvenForm() {
        // Create the event form
        this.eventForm = this._formBuilder.group({
            id: [''],
            calendarId: [''],
            ceremonyId: [null],
            recurringEventId: [null],
            title: [''],
            description: [''],
            start: [null],
            end: [null],
            duration: [null],
            allDay: [false],
            recurrence: [null],
            range: [{}],
            emailUser: [' ']
        });

        // Subscribe to 'range' field value changes
        this.eventForm.get('range').valueChanges.subscribe((value) => {

            if (!value) {
                return;
            }

            // Set the 'start' field value from the range
            this.eventForm.get('start').setValue(value.start, { emitEvent: false });

            // If this is a recurring event...
            if (this.eventForm.get('recurrence').value) {
                // Update the recurrence rules if needed
                this._updateRecurrenceRule();

                // Set the duration field
                const duration = moment(value.end).diff(moment(value.start), 'minutes');
                this.eventForm.get('duration').setValue(duration, { emitEvent: false });

                // Update the end value
                this._updateEndValue();
            }
            // Otherwise...
            else {
                // Set the end field
                this.eventForm.get('end').setValue(value.end, { emitEvent: false });
            }
        });

        // Subscribe to 'recurrence' field changes
        this.eventForm.get('recurrence').valueChanges.subscribe((value) => {

            // If this is a recurring event...
            if (value) {
                // Update the end value
                this._updateEndValue();
            }
        });
    }
    getCalendars() {
        // Get calendars
        this._calendarService.calendars$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((calendars) => {

                // Store the calendars
                this.calendars = calendars;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    getEvents() {// Get events
        this._calendarService.events$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((events) => {

                // Clone the events to change the object reference so
                // that the FullCalendar can trigger a re-render.
                this.events = cloneDeep(events);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    getSettings() {
        // Get settings
        this._calendarService.settings$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {

                // Store the settings
                this.settings = settings;

                // Set the FullCalendar event time format based on the time format setting
                this.eventTimeFormat = {
                    hour: settings.timeFormat === '12' ? 'numeric' : '2-digit',
                    hour12: settings.timeFormat === '12',
                    minute: '2-digit',
                    meridiem: settings.timeFormat === '12' ? 'short' : false
                };

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    configureMedia() {
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if (matchingAliases.includes('md')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    configureCalendarView() {
        this.views = {
            dayGridMonth: {
                eventLimit: 3,
                eventTimeFormat: this.eventTimeFormat,
                fixedWeekCount: false
            },
            timeGrid: {
                allDayText: '',
                columnHeaderFormat: {
                    weekday: 'short',
                    day: 'numeric',
                    omitCommas: true
                },
                columnHeaderHtml: (date): string => `<span class="fc-weekday">${moment(date).format('ddd')}</span>
                                                       <span class="fc-date">${moment(date).format('D')}</span>`,
                slotDuration: '01:00:00',
                slotLabelFormat: this.eventTimeFormat
            },
            timeGridWeek: {},
            timeGridDay: {},
            listYear: {
                allDayText: 'All day',
                eventTimeFormat: this.eventTimeFormat,
                listDayFormat: false,
                listDayAltFormat: false
            }
        };
    }
    /******
     * Meets
     */
    getMeetsByUser() {
        this._meetService.meetListByUser().subscribe(
            data => {
                this.meets = data;
                this._changeDetectorRef.markForCheck();
            }
        );
    }


    getProject(id: number) {
        let selectedProject: Project = new Project()
        if (!id) {
            return;
        }
        if (this.idOld != id) {
            this.loop = true;
        }
        if (this.loop == true) {
            this.idOld = id;
        }

        selectedProject = this.projects.filter(project => project.idProject == id)[0];

        if (selectedProject != undefined && this.loop) {
            this.participants=[];
            this._projectService.getProjectRessources(selectedProject.idProject).subscribe(
                data => {
                    if (data != null) {
                        data.forEach(ressource=>{
                            if(ressource.user.email!=this.currentUserEmail){
                                this.participants.push(ressource.user);
                                this._changeDetectorRef.markForCheck();
                            }
                            this._changeDetectorRef.markForCheck(); 
                        })
                        if(this.panelMode=="edit"){
                            this.filterParticipations();
                        }
                        this._changeDetectorRef.markForCheck();
                    } else {
                        console.log("NO participants")
                    }

                }, error => {

                }
            )
            this.loop = false;
            
        }
        
        return selectedProject;
    }
    getUser(email: string) {
        if (!email) {
            return;
        }
        if (this.oldMail != email) {
            this.loopUser = true;
        }
        if (this.loop == true) {
            this.oldMail = email;
        }
        return this.participants.filter(participant => participant.email == email)[0];

    }
    getProjects() {
        if (localStorage.getItem("role") == "Manager") {
            this._projectService.getProjectsByDepartment().subscribe(
                data => {
                    this.projects = data;
                    this._changeDetectorRef.markForCheck();
                    for (let i = 0; i < this.projects.length; i++) {
                        this.projects[i].color = calendarColors[(calendarColors.length) - i - 1];
                    }
                }
            )
        } else {
            this._projectService.getProjectForConsulant().subscribe(
                data => {
                    this.projects = data;
                    this._changeDetectorRef.markForCheck();
                    for (let i = 0; i < this.projects.length; i++) {
                        this.projects[i].color = calendarColors[(calendarColors.length) - i - 1];
                    }
                }
            )
        }
    }
    getCeremonies() {
        this._meetService.ceremoniesList().subscribe(
            data => {
                this.ceremonies = data;
                this._changeDetectorRef.markForCheck();
            }
        )
    }
    getCeremony(id: number) {
        let selectedCeremony: Ceremony = new Ceremony()
        if (!id) {
            return "select a ceremony";
        }
        selectedCeremony = this.ceremonies.filter(ceremony => ceremony.idCeremony == id)[0];
        return selectedCeremony;
    }
    addParticipant() {
        let email=this.eventForm.get('emailUser').value;
        let matchingParticipant = this.participants.find(participant => participant.email == email);

        if (matchingParticipant) {
            if(this.users.filter(user=> user.email== matchingParticipant.email).length<1){
                this.users.push(matchingParticipant); 
                this.lengthUsers++;
            }
            // add the user to the array
            //this.userIds.push(this.users[this.lengthUsers].idUser);
            
            this.eventForm.get('emailUser').setValue("");
            
        }
        this.participants= this.participants.filter(participant => participant.email != email);
        
    }
    getProjectForEvent(id):Project {
        
        if (!id) {
            return this.projects[0];       ;
        }
        let meet = this.meets.filter(meet => meet.idMeet == id)[0];
        let project= this.projects.filter(project => project.idProject == meet.project.idProject)[0]
        if(project){
            return project
        }
        return this.projects[0];
    }
    getParticipantsByMeet(idMeet){
        this._meetService.participantsListByMeet(idMeet).subscribe(
            data => {
                if (data != null) {
                    this.users=data;
                    this.users=this.users.filter(user=> user.email!=this.currentUserEmail)
                    this.lengthUsers=data.length;
                    this._changeDetectorRef.markForCheck();
                } else {
                    console.log("NO participants")
                }

            }, error => {

            }
        )
    }
    getProjectRessources(idProject){
        this._projectService.getProjectRessources(idProject).subscribe(
            data => {
                if (data != null) {
                    data.forEach(ressource=>{
                        if(ressource.user.email!=this.currentUserEmail){
                            this.participants.push(ressource.user);
                            this._changeDetectorRef.markForCheck();
                        }
                    })
                    this._changeDetectorRef.markForCheck();
                } else {
                    console.log("NO participants")
                }

            }, error => {

            }
        )
        
    }
    removeFromParticipations(idUser){
        const user=this.users.filter(user=> user.idUser== idUser)[0];
        this.users=this.users.filter(user=> user.idUser!= idUser)
        this.participants.push(user);
        this.lengthUsers--;

    }
    filterParticipations() {
        const filteredUsers: User[] = [];
        let user;
        for(let i=0; i<this.participants.length;i++){
            user=this.users.filter(user=> user.idUser==this.participants[i].idUser)[0];
            if(!user){
                filteredUsers.push(this.participants[i]);
            }
        }
        this.participants=filteredUsers;
      }
      checkBeforeAdd(){
        let newEvent = clone(this.eventForm.value)
        if(this.projects.filter(project => project.idProject == +this.eventForm.get('calendarId').value)[0]==undefined ||
        this.eventForm.get('ceremonyId').value == null|| newEvent.title==""){
            return true;
        }
        
        return false;
      }
}
