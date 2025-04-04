import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorApplicationDetailComponent } from './sponsor-application-detail.component';

describe('SponsorApplicationDetailComponent', () => {
  let component: SponsorApplicationDetailComponent;
  let fixture: ComponentFixture<SponsorApplicationDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SponsorApplicationDetailComponent]
    });
    fixture = TestBed.createComponent(SponsorApplicationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
