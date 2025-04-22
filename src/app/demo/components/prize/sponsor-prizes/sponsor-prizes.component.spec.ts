import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorPrizesComponent } from './sponsor-prizes.component';

describe('SponsorPrizesComponent', () => {
  let component: SponsorPrizesComponent;
  let fixture: ComponentFixture<SponsorPrizesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SponsorPrizesComponent]
    });
    fixture = TestBed.createComponent(SponsorPrizesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
