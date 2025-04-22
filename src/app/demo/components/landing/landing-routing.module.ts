import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LandingComponent } from './landing.component';
import { PrizeFormComponent } from '../prize/prize-form/prize-form.component';
import { LandingTeamSubmissionComponent } from './landing-team-submission/landing-team-submission.component';
import { LandingProjectEvaluationComponent } from './landing-project-evaluation/landing-project-evaluation.component';

const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
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
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
