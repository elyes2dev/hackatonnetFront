import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HackathonListComponent } from './hackathon-list.component';

describe('HackathonListComponent', () => {
  let component: HackathonListComponent;
  let fixture: ComponentFixture<HackathonListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HackathonListComponent]
    });
    fixture = TestBed.createComponent(HackathonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
