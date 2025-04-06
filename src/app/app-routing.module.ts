import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { MydashboardComponent } from './demo/components/mydashboard/mydashboard.component';
import { WorkshoplistComponent } from './demo/components/workshop/workshoplist/workshoplist.component';
import { WorkshopFormComponent } from './demo/components/workshop/workshop-form/workshop-form.component';
import { WorkshopDetailsComponent } from './demo/components/workshop/workshop-details/workshop-details.component';
import { ResourceListComponent } from './demo/components/resource/resource-list/resource-list.component';
import { ResourceFormComponent } from './demo/components/resource/resource-form/resource-form.component';
import { ResourceDetailsComponent } from './demo/components/resource/resource-details/resource-details.component';
import { QuizListComponent } from './demo/components/quiz/quiz-list/quiz-list.component';
import { QuizFormComponent } from './demo/components/quiz/quiz-form/quiz-form.component';
import { QuizDetailsComponent } from './demo/components/quiz/quiz-details/quiz-details.component';
import { QuizScoreAddComponent } from './demo/components/quiz/quiz-score-add/quiz-score-add.component';
import { WorkshoplistfComponent } from './demo/components/workshopf/workshoplistf/workshoplistf.component';
import { WorkshopfFormComponent } from './demo/components/workshopf/workshopf-form/workshopf-form.component';
import { WorkshopfDetailsComponent } from './demo/components/workshopf/workshopf-details/workshopf-details.component';

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
                    
                    // Dashboard
                    { path: 'mydashboard', component: MydashboardComponent },

                    // Workshops Routes
                    { path: 'workshops', 
                        children: [
                            { path: '', component: WorkshoplistComponent },  // List Workshops
                            { path: 'new', component: WorkshopFormComponent },  // Add New Workshop
                            { path: ':id/edit', component: WorkshopFormComponent },  // Edit Workshop
                            { path: ':id', component: WorkshopDetailsComponent }  // Workshop Details
                        ]
                    },

                    // Resources Routes inside Workshops
                    { path: 'workshops/:workshopId/resources', component: ResourceListComponent },  // List Resources
                    { path: 'workshops/:workshopId/resources/new', component: ResourceFormComponent },  // Add Resource
                    { path: 'workshops/:workshopId/resources/:resourceId/edit', component: ResourceFormComponent },  // Edit Resource
                    { path: 'workshops/:workshopId/resources/:resourceId', component: ResourceDetailsComponent },  // Resource Details


                    {
                        path: 'workshops/:workshopId/quizzes',
                        component: QuizListComponent,
                      },
                      {
                        path: 'workshops/:workshopId/quizzes/new',
                        component: QuizFormComponent,
                      },
                      {
                        path: 'workshops/:workshopId/quizzes/:quizId/edit',
                        component: QuizFormComponent,
                      },
                      {
                        path: 'workshops/:workshopId/quizzes/:quizId/details',
                        component: QuizDetailsComponent,
                      },
                      {
                        path: 'workshops/:workshopId/quizzes/:quizId/score-add',
                        component: QuizScoreAddComponent // Replace with your actual component
                      }
                      
                ],
            },






            // Workshops Routes
// Workshops Routes
{
    path: 'workshopsf', 
    children: [
      { path: '', component: WorkshoplistfComponent },  // List Workshops
      { path: 'new', component: WorkshopfFormComponent },  // Add New Workshop
      { path: ':id/edit', component: WorkshopfFormComponent },  // Edit Workshop
      { path: ':id', component: WorkshopfDetailsComponent }  // Workshop Details
    ]
  },
  
  // Resources Routes inside Workshops
  {
    path: 'workshopsf/:workshopId/resources', 
    children: [
    //  { path: '', component: ResourceListFComponent },  // List Resources
    //  { path: 'new', component: ResourceFormFComponent },  // Add Resource
    //  { path: ':resourceId/edit', component: ResourceFormFComponent },  // Edit Resource
    //  { path: ':resourceId', component: ResourceDetailsFComponent },  // Resource Details
    ]
  },
  
  {
    path: 'workshopsf/:workshopId/quizzes',
    children: [
    //  { path: '', component: QuizListFComponent },  // List Quizzes
    //  { path: 'new', component: QuizFormFComponent },  // Add Quiz
    //  { path: ':quizId/edit', component: QuizFormFComponent },  // Edit Quiz
    //  { path: ':quizId/details', component: QuizDetailsFComponent },  // Quiz Details
     // { path: ':quizId/score-add', component: QuizScoreAddFComponent }, // Add Score
    ]
  }
  ,

            // Authentication & Other Routes
            { path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
            { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
            { path: 'pages/notfound', component: NotfoundComponent },
            { path: '**', redirectTo: 'pages/notfound' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
