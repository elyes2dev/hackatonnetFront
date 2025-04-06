import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcefFormComponent } from './resourcef-form.component';

describe('ResourcefFormComponent', () => {
  let component: ResourcefFormComponent;
  let fixture: ComponentFixture<ResourcefFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResourcefFormComponent]
    });
    fixture = TestBed.createComponent(ResourcefFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
