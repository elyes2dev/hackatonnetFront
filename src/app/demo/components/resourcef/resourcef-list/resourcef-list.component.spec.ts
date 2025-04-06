import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcefListComponent } from './resourcef-list.component';

describe('ResourcefListComponent', () => {
  let component: ResourcefListComponent;
  let fixture: ComponentFixture<ResourcefListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResourcefListComponent]
    });
    fixture = TestBed.createComponent(ResourcefListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
