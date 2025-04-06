import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MydashboardComponent } from './mydashboard.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [MydashboardComponent],
  imports: [
    CommonModule,// Add this
    ReactiveFormsModule
  ]
})
export class MydashboardModule { }