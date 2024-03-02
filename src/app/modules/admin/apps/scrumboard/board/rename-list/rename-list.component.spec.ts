import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameListComponent } from './rename-list.component';

describe('RenameListComponent', () => {
  let component: RenameListComponent;
  let fixture: ComponentFixture<RenameListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenameListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
