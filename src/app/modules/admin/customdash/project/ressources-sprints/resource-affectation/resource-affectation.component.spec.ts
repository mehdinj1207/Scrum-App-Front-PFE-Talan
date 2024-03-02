import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceAffectationComponent } from './resource-affectation.component';

describe('ResourceAffectationComponent', () => {
  let component: ResourceAffectationComponent;
  let fixture: ComponentFixture<ResourceAffectationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResourceAffectationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceAffectationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
