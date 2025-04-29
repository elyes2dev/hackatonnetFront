import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RatingModule } from 'primeng/rating';
import { SliderModule } from 'primeng/slider';
import { MessageService } from 'primeng/api';

import { SubmissionDetailsComponent } from './submission-details.component';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { ProjectEvaluationComponent } from '../../../project-evaluation/project-evaluation.component';

@NgModule({
  declarations: [
    SubmissionDetailsComponent,
    NavbarComponent,
    ProjectEvaluationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    ToastModule,
    ChartModule,
    TagModule,
    TooltipModule,
    DialogModule,
    DynamicDialogModule,
    ProgressSpinnerModule,
    RatingModule,
    SliderModule
  ],
  providers: [
    MessageService
  ],
  exports: [
    SubmissionDetailsComponent
  ]
})
export class SubmissionDetailsModule { }
