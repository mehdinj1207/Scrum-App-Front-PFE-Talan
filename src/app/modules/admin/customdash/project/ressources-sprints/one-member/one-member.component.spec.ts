import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneMemberComponent } from './one-member.component';

describe('OneMemberComponent', () => {
  let component: OneMemberComponent;
  let fixture: ComponentFixture<OneMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneMemberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
