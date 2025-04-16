import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousExperienceFormComponent } from './previous-experience-form.component';

describe('PreviousExperienceFormComponent', () => {
  let component: PreviousExperienceFormComponent;
  let fixture: ComponentFixture<PreviousExperienceFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreviousExperienceFormComponent]
    });
    fixture = TestBed.createComponent(PreviousExperienceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
