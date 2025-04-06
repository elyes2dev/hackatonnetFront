import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizfFormComponent } from './quizf-form.component';

describe('QuizfFormComponent', () => {
  let component: QuizfFormComponent;
  let fixture: ComponentFixture<QuizfFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuizfFormComponent]
    });
    fixture = TestBed.createComponent(QuizfFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
