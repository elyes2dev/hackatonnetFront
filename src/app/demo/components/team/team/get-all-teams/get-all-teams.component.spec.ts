import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetAllTeamsComponent } from './get-all-teams.component';

describe('GetAllTeamsComponent', () => {
  let component: GetAllTeamsComponent;
  let fixture: ComponentFixture<GetAllTeamsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GetAllTeamsComponent]
    });
    fixture = TestBed.createComponent(GetAllTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
