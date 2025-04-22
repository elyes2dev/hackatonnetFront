import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousExperienceListComponent } from './previous-experience-list.component';

describe('PreviousExperienceListComponent', () => {
  let component: PreviousExperienceListComponent;
  let fixture: ComponentFixture<PreviousExperienceListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreviousExperienceListComponent]
    });
    fixture = TestBed.createComponent(PreviousExperienceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
