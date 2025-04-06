import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceFormComponent } from './resource-form.component';

describe('ResourceFormComponent', () => {
  let component: ResourceFormComponent;
  let fixture: ComponentFixture<ResourceFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResourceFormComponent]
    });
    fixture = TestBed.createComponent(ResourceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
