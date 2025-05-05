import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
import { StyleClassModule } from 'primeng/styleclass';
import { DividerModule } from 'primeng/divider';
import { ChartModule } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { RouterModule } from '@angular/router';
import { LandingHackathonModule } from './Hackathon/landing-hackathon.module';
import { LandingProjectEvaluationComponent } from './landing-project-evaluation/landing-project-evaluation.component'; // Nouveau
import { LandingTeamSubmissionComponent } from './landing-team-submission/landing-team-submission.component'; // Nouveau
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    imports: [
        CommonModule,
        LandingRoutingModule,
        RouterModule,
        DividerModule,
        StyleClassModule,
        ChartModule,
        PanelModule,
        ButtonModule,
        AvatarModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        InputTextModule,
        RippleModule,
        InputTextareaModule,
        ToastModule,
        DialogModule,
        LandingHackathonModule,
        InputNumberModule,
        ProgressSpinnerModule
    ],
    declarations: [LandingComponent, LandingProjectEvaluationComponent, LandingTeamSubmissionComponent]
})
export class LandingModule { }
