import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import for Angular common directives
import { WorkshoplistComponent } from './workshoplist.component';
import { WorkshopService } from 'src/app/demo/services/workshop.service';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [WorkshoplistComponent],
  imports: [
    CommonModule,
    BrowserModule, // Enables Angular common directives like ngIf, ngFor, etc.
    ReactiveFormsModule
  ],
  providers: [WorkshopService]
})
export class WorkshoplistModule { }
