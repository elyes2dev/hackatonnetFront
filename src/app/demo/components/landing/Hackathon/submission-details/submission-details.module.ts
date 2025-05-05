import { NgModule ,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { InputNumberModule } from 'primeng/inputnumber';

import { SubmissionDetailsComponent } from './submission-details.component';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { ProjectEvaluationComponent } from '../../../project-evaluation/project-evaluation.component';
import { FooterComponent } from '../../footer/footer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EvaluationDialogModule } from '../../../../components/evaluation-dialog/evaluation-dialog.module';
import { LandingModule } from '../../landing.module';

@NgModule({
  declarations: [
    SubmissionDetailsComponent,
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
    SliderModule,   
    InputNumberModule,
    SharedModule, // Import SharedModule here
    EvaluationDialogModule, // Import EvaluationDialogModule
    LandingModule // Import LandingModule which contains LandingProjectEvaluationComponent
  ],
  providers: [
    MessageService
  ],
  exports: [
    SubmissionDetailsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add schema to handle custom elements

})
export class SubmissionDetailsModule { }
