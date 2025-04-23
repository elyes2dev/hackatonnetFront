import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkshoplistfComponent } from './workshoplistf.component';
import { WorkshoplistfRoutingModule } from './workshoplistf-routing.module';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { ProgressBarModule } from 'primeng/progressbar';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { FilterByNameAndThemePipe } from './filter-by-name-and-theme.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    WorkshoplistfRoutingModule,
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    InputTextModule,
    RatingModule,
    ProgressBarModule,
    DropdownModule,
    TooltipModule
  ],
  declarations: [WorkshoplistfComponent, FilterByNameAndThemePipe]
})
export class WorkshoplistfModule { }
