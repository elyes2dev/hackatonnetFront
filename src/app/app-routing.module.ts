import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { MydashboardComponent } from './demo/components/mydashboard/mydashboard.component';
import { MentorApplicationDetailsComponent } from './demo/components/mentor-application/mentor-application-details/mentor-application-details.component';
import { MentorApplicationFormComponent } from './demo/components/mentor-application/mentor-application-form/mentor-application-form.component';
import { MentorApplicationListComponent } from './demo/components/mentor-application/mentor-application-list/mentor-application-list.component';
import { MentorApplicationDetailsAdminComponent } from './demo/components/mentor-application/mentor-application-details-admin/mentor-application-details-admin.component';
import { ListMentorFormComponent } from './demo/components/list-mentor/list-mentor-form/list-mentor-form.component';
import { ListMentorListComponent } from './demo/components/list-mentor/list-mentor-list/list-mentor-list.component';
import { MentorEvaluationFormComponent } from './demo/components/mentor-evaluation/mentor-evaluation-form/mentor-evaluation-form.component';
import { MentorEvaluationListComponent } from './demo/components/mentor-evaluation/mentor-evaluation-list/mentor-evaluation-list.component';
import { MentorEvaluationFormAdminComponent } from './demo/components/mentor-evaluation/mentor-evaluation-form-admin/mentor-evaluation-form-admin.component';
import { ListMentorFormAdminComponent } from './demo/components/list-mentor/list-mentor-form-admin/list-mentor-form-admin.component';
import { MentorEvaluationListUserComponent } from './demo/components/mentor-evaluation/mentor-evaluation-list-user/mentor-evaluation-list-user.component';


@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppLayoutComponent,
                children: [
                    { path: '', loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
                    { path: 'uikit', loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UikitModule) },
                    { path: 'utilities', loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
                    { path: 'documentation', loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) },
                    { path: 'blocks', loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
                    { path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) },
                    // New Update Template
                    { path: 'mydashboard', component: MydashboardComponent },

                    { path: 'mentor-applications', component: MentorApplicationListComponent },
                    { path: 'mentor-applications-admin/:id', component: MentorApplicationDetailsAdminComponent },
                    { path: 'list-mentors', component: ListMentorListComponent },
                    { path: 'mentor/edit/:id', component: ListMentorFormAdminComponent },
                    { path: 'mentor-evaluations', component: MentorEvaluationListComponent },
                    { path: 'mentor-evaluation-admin/:id/edit', component: MentorEvaluationFormAdminComponent },
                    
                ],
            },
            { path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
            { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
            { path: 'mentor-applications/new', component: MentorApplicationFormComponent },
            { path: 'mentor-applications/:id', component: MentorApplicationDetailsComponent },
            {  path: 'mentor-applications/:id/edit',  component: MentorApplicationFormComponent },
            { path: 'mentor-applications/:id/edit', component: MentorApplicationFormComponent },
            { path: 'mentor-evaluations-user', component: MentorEvaluationListUserComponent },


              { path: 'mentor-form', component: ListMentorFormComponent },
            { path: 'mentor-evaluation/new', component: MentorEvaluationFormComponent },
            { path: 'mentor-evaluation/:id/edit', component: MentorEvaluationFormComponent },


            { path: 'pages/notfound', component: NotfoundComponent },
            { path: '**', redirectTo: 'pages/notfound' },

            
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
