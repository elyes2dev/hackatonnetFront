import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SliderModule } from 'primeng/slider';
import { ToastModule } from 'primeng/toast';
import { EvaluationDialogComponent } from './evaluation-dialog.component';

@NgModule({
  declarations: [
    EvaluationDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextareaModule,
    SliderModule,
    ToastModule
  ],
  exports: [
    EvaluationDialogComponent
  ]
})
export class EvaluationDialogModule { }
