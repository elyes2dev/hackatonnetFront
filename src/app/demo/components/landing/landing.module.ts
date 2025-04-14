import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Déjà présent pour ngModel
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
import { StyleClassModule } from 'primeng/styleclass';
import { DividerModule } from 'primeng/divider';
import { ChartModule } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { LandingProjectEvaluationComponent } from './landing-project-evaluation/landing-project-evaluation.component'; // Nouveau
import { LandingTeamSubmissionComponent } from './landing-team-submission/landing-team-submission.component'; // Nouveau

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LandingRoutingModule,
    DividerModule,
    StyleClassModule,
    ChartModule,
    PanelModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    InputTextareaModule,
    ToastModule
  ],
  declarations: [
    LandingComponent,
    NavbarComponent,
    FooterComponent,
    LandingProjectEvaluationComponent, // Ajouté
    LandingTeamSubmissionComponent     // Ajouté
  ]
})
export class LandingModule { }