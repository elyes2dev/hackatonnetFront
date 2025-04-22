import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorApplicationFormComponent } from './sponsor-application-form.component';

describe('SponsorApplicationFormComponent', () => {
  let component: SponsorApplicationFormComponent;
  let fixture: ComponentFixture<SponsorApplicationFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SponsorApplicationFormComponent]
    });
    fixture = TestBed.createComponent(SponsorApplicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
