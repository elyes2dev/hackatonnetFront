
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { PrizeFormComponent } from '../prize/prize-form/prize-form.component';
import { TeamFrontofficeComponent } from '../team-frontoffice/team-frontoffice.component';
import { LandingTeamSubmissionComponent } from './landing-team-submission/landing-team-submission.component';
import { LandingProjectEvaluationComponent } from './landing-project-evaluation/landing-project-evaluation.component';
import { FormsModule } from '@angular/forms'; // ✅ Needed for ngModel

const routes: Routes = [
    { path: '', component: LandingComponent,
        children: [
            {
                path: 'team-submission',
                component: LandingTeamSubmissionComponent
            },
            {
                path: 'project-evaluation',
                component: LandingProjectEvaluationComponent
            }
        ]
    },
    {path: 'landing', component: LandingComponent},
];

  @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
  })
  export class LandingRoutingModule { }
