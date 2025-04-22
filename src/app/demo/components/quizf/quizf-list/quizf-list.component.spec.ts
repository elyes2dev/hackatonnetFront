import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizfListComponent } from './quizf-list.component';

describe('QuizfListComponent', () => {
  let component: QuizfListComponent;
  let fixture: ComponentFixture<QuizfListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuizfListComponent]
    });
    fixture = TestBed.createComponent(QuizfListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
