import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PreviousExperience } from 'src/app/demo/models/previous-experience.model';

@Component({
  selector: 'app-previous-experience-form',
  templateUrl: './previous-experience-form.component.html',
  styleUrls: ['./previous-experience-form.component.scss']
})
export class PreviousExperienceFormComponent implements OnInit {
  @Input() experienceForm!: FormGroup;
  @Input() index!: number;
  @Input() experienceData?: PreviousExperience; // Add this input for explicit data binding

  @Output() removeExperienceEvent = new EventEmitter<number>();

  currentYear = new Date().getFullYear();

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    if (!this.experienceForm) {
      this.experienceForm = this.createExperienceForm();
    }
    if (this.experienceData) {
      this.experienceForm.patchValue(this.experienceData);
    }
  }

  createExperienceForm(): FormGroup {
    return this.fb.group({
      hackathonName: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(2000), Validators.max(this.currentYear)]],
      description: ['', Validators.required],
      numberOfTeamsCoached: ['', [Validators.required, Validators.min(1)]]
    });
  }

  removeExperience(): void {
    this.removeExperienceEvent.emit(this.index);
  }
}