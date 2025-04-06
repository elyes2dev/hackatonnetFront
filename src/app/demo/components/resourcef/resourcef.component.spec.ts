import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcefComponent } from './resourcef.component';

describe('ResourcefComponent', () => {
  let component: ResourcefComponent;
  let fixture: ComponentFixture<ResourcefComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResourcefComponent]
    });
    fixture = TestBed.createComponent(ResourcefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
