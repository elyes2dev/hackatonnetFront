import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LandingComponent } from './landing.component';
import { PrizeFormComponent } from '../prize/prize-form/prize-form.component';
import { LandingTeamSubmissionComponent } from './landing-team-submission/landing-team-submission.component';
import { LandingProjectEvaluationComponent } from './landing-project-evaluation/landing-project-evaluation.component';
import { Routes } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: LandingComponent }
    ])],
    exports: [RouterModule]
})
export class LandingRoutingModule { }
