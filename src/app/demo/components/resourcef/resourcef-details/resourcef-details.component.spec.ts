import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcefDetailsComponent } from './resourcef-details.component';

describe('ResourcefDetailsComponent', () => {
  let component: ResourcefDetailsComponent;
  let fixture: ComponentFixture<ResourcefDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResourcefDetailsComponent]
    });
    fixture = TestBed.createComponent(ResourcefDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
