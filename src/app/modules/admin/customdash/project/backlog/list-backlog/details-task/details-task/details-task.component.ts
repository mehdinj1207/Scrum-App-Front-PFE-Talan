import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BacklogListComponent } from '../../list-backlog.component'; 
import { TicketsService } from '../../../../services/ticket.service';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
@Component({
  selector: 'app-details-task',
  templateUrl: './details-task.component.html',
  styleUrls: ['./details-task.component.scss']
})
export class DetailsTaskComponent implements OnInit {

  constructor(private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _backlogListComponent: BacklogListComponent,
    private _router: Router,
    private _ticketService: TicketsService) { }

  ngOnInit(): void {
    this._backlogListComponent.matDrawer.open();
  }
  closeDrawer(): Promise<MatDrawerToggleResult> {
    this._backlogListComponent.matDrawer.opened = false;
    return this._backlogListComponent.matDrawer.close();
}
}
