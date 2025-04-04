import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorApplicationListComponent } from './sponsor-application-list.component';

describe('SponsorApplicationListComponent', () => {
  let component: SponsorApplicationListComponent;
  let fixture: ComponentFixture<SponsorApplicationListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SponsorApplicationListComponent]
    });
    fixture = TestBed.createComponent(SponsorApplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
