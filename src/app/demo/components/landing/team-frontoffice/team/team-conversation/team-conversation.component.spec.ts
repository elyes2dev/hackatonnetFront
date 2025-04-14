import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamConversationComponent } from './team-conversation.component';

describe('TeamConversationComponent', () => {
  let component: TeamConversationComponent;
  let fixture: ComponentFixture<TeamConversationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamConversationComponent]
    });
    fixture = TestBed.createComponent(TeamConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
