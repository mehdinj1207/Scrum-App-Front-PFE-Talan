import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketAssignmentComponent } from './ticket-assignment.component';

describe('TicketAssignmentComponent', () => {
  let component: TicketAssignmentComponent;
  let fixture: ComponentFixture<TicketAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
