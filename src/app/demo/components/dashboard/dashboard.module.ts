import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { DashboardsRoutingModule } from './dashboard-routing.module';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { StyleClassModule } from 'primeng/styleclass';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { RatingModule } from 'primeng/rating';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { MydashboardComponent } from '../mydashboard/mydashboard.component';

@NgModule({
    imports: [
        // Angular Modules
        CommonModule,
        FormsModule,

        // PrimeNG Modules
        ButtonModule,
        ChartModule,
        MenuModule,
        PanelMenuModule,
        StyleClassModule,
        TableModule,
        ReactiveFormsModule,
        ProgressBarModule,
        ToggleButtonModule,
        ToastModule,
        RatingModule,
        MultiSelectModule,
        DropdownModule,
        SliderModule,

        // Routing
        DashboardsRoutingModule
    ],
    declarations: [DashboardComponent, MydashboardComponent]
})
export class DashboardModule { }
