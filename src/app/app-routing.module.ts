import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { MydashboardComponent } from './demo/components/mydashboard/mydashboard.component';
import { WorkshoplistComponent } from './demo/components/workshop/workshoplist/workshoplist.component';
import { WorkshopFormComponent } from './demo/components/workshop/workshop-form/workshop-form.component';
import { WorkshopDetailsComponent } from './demo/components/workshop/workshop-details/workshop-details.component';
import { UserComponent } from './demo/components/user/user.component';
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
import { ResourcefFormComponent } from './demo/components/resourcef/resourcef-form/resourcef-form.component';
import { ResourcefListComponent } from './demo/components/resourcef/resourcef-list/resourcef-list.component';
import { ResourcefDetailsComponent } from './demo/components/resourcef/resourcef-details/resourcef-details.component';
import { QuizfListComponent } from './demo/components/quizf/quizf-list/quizf-list.component';
import { QuizfFormComponent } from './demo/components/quizf/quizf-form/quizf-form.component';
import { QuizfDetailsComponent } from './demo/components/quizf/quizf-details/quizf-details.component';
import { QuizfScoreAddComponent } from './demo/components/quizf/quizf-score-add/quizf-score-add.component';
import { ChartsComponent } from './demo/components/charts/charts.component';
import { SupportTicketComponent } from './demo/components/ticket/support-ticket.component';
import { PrizeListComponent } from './demo/components/prize/prize-list/prize-list.component';
import { PrizeDetailComponent } from './demo/components/prize/prize-detail/prize-detail.component';
import { SponsorApplicationDetailComponent } from './demo/components/sponsor/sponsor-application-detail/sponsor-application-detail.component';
import { SponsorApplicationListComponent } from './demo/components/sponsor/sponsor-application-list/sponsor-application-list.component';
import { PrizeFormComponent } from './demo/components/prize/prize-form/prize-form.component';
import { SponsorLeaderboardComponent } from './demo/components/sponsor/sponsor-leaderboard/sponsor-leaderboard.component';
import { SponsorPrizesComponent } from './demo/components/prize/sponsor-prizes/sponsor-prizes.component';
import { SponsorApplicationFormComponent } from './demo/components/sponsor/sponsor-application-form/sponsor-application-form.component';
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
import { UserProfileComponent } from './demo/components/user-profile/user-profile.component';
import { HackathonListComponent } from './demo/components/hackathons/hackathon-list/hackathon-list/hackathon-list.component';
import { HackathonDetailsComponent } from './demo/components/hackathons/hackathon-details/hackathon-details.component';
import { LiveStreamComponent } from './demo/components/live-stream/live-stream/live-stream.component';
import { VideoRoomComponent } from './demo/components/live-stream/video-room/video-room.component';
import { LandingHackathonListComponent } from './demo/components/landing/Hackathon/landing-hackathon-list/landing-hackathon-list.component';
import { LandingHackathonDetailsComponent } from './demo/components/landing/Hackathon/landing-hackathon-details/landing-hackathon-details.component';
import { HackathonAnalyticsComponent } from './demo/components/Analytics/hackathon-analytics/hackathon-analytics.component';
import { HackathonCategorizationAnalyticsComponent } from './demo/components/Analytics/hackathon-categorization-analytics/hackathon-categorization-analytics.component';
import { AccessDeniedComponent } from './demo/components/hackathons/hackathon-list/access-denied/access-denied.component';
import { AdminGuard } from './demo/services/hackathon/AuthGuard/auth-guard.service';
import { Component } from '@angular/core';
import { GeneralComponent } from './demo/components/general/general.component';

import { TeamSubmissionComponent } from './demo/components/team-submission/team-submission.component';  // Import du composant
import { ProjectEvaluationComponent } from './demo/components/project-evaluation/project-evaluation.component';
import {
    LandingProjectEvaluationComponent
} from "./demo/components/landing/landing-project-evaluation/landing-project-evaluation.component";
import {
    LandingTeamSubmissionComponent
} from "./demo/components/landing/landing-team-submission/landing-team-submission.component";
import { TeamFrontofficeComponent } from './demo/components/team-frontoffice/team-frontoffice.component';
import { AuthGuard } from './demo/jwt/auth.guard';
import { TeamChatHubComponent } from './demo/components/team/team-chat-hub/team-chat-hub.component';




@NgModule({
    imports: [
        RouterModule.forRoot([
          { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
            {

                path: '', component: AppLayoutComponent,
                children: [
                    { path: '', component: GeneralComponent},
                    { path: 'uikit', loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UikitModule) },
                    { path: 'utilities', loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
                    { path: 'documentation', loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) },
                    { path: 'blocks', loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
                    { path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) },

                    // Dashboard
                    { path: 'support-tickets', component: SupportTicketComponent },  // Add support ticket component route
                    { path: 'mydashboard', component: MydashboardComponent },
                    { path: 'project-evaluations', component: ProjectEvaluationComponent },

                    // Nouvelle route pour accéder au composant TeamSubmission
                    { path: 'team-submission', component: TeamSubmissionComponent },  // Ajout de la route
                    { path: 'prizes', component: PrizeListComponent },
                    { path: 'prizes/:id', component: PrizeDetailComponent },
                    { path: 'sponsor-application', component: SponsorApplicationListComponent },
                    { path: 'sponsor-application/:id', component: SponsorApplicationDetailComponent },

                    // User Management Route
                    { path: 'users', component: UserComponent },  // Add UserComponent Route
// Team Module Route
                    { path: 'teams', loadChildren: () => import('./demo/components/team/team.module').then(m => m.TeamModule) },
                    { path: 'teamfront', component: TeamFrontofficeComponent },


                    { path: 'mentor-applications', component: MentorApplicationListComponent },
                    { path: 'mentor-applications-admin/:id', component: MentorApplicationDetailsAdminComponent },
                    { path: 'list-mentors', component: ListMentorListComponent },
                    { path: 'mentor/edit/:id', component: ListMentorFormAdminComponent },
                    { path: 'mentor-evaluations', component: MentorEvaluationListComponent },
                    { path: 'mentor-evaluation-admin/:id/edit', component: MentorEvaluationFormAdminComponent },
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
                      },
                    { path: 'live-stream/:id', component: LiveStreamComponent },

                    { path: 'mydashboard', component: MydashboardComponent },
                    // { path: 'hackathons', component: HackathonListComponent },
                    {
                      path: 'hackathons', // Update with your actual path
                      component: HackathonListComponent,
                      canActivate: [AdminGuard] // Add this guard
                    },
                    { path: 'hackathon/:id', component: HackathonDetailsComponent },
                    { path: 'hackathon-analytics', component: HackathonAnalyticsComponent },
                    { path: 'hackathon-categorization', component: HackathonCategorizationAnalyticsComponent },
                    {
                      path: 'access-denied',
                      component: AccessDeniedComponent
                    },

                ], canActivate: [AuthGuard], data: { role: 'admin' }
            },

            { path: ':hackathonId/call/:roomId', component: VideoRoomComponent },






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
      { path: '', component: ResourcefListComponent },  // List Resources
      { path: 'new', component: ResourcefFormComponent },  // Add Resource
      { path: ':resourceId/edit', component: ResourcefFormComponent },  // Edit Resource
      { path: ':resourceId', component: ResourcefDetailsComponent },  // Resource Details
    ]
  },

  {
    path: 'workshopsf/:workshopId/quizzes',
    children: [
      { path: '', component: QuizfListComponent },  // List Quizzes
      { path: 'new', component: QuizfFormComponent },  // Add Quiz
      { path: ':quizId/edit', component: QuizfFormComponent },  // Edit Quiz
      { path: ':quizId/details', component: QuizfDetailsComponent },  // Quiz Details
      { path: ':quizId/score-add', component: QuizfScoreAddComponent }, // Add Score
    ]
  }
  ,
  { path: 'charts', component: ChartsComponent },  // Resource Details


            // Authentication & Other Routes
            { path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
            
            { path: 'landing-hackathons', component: LandingHackathonListComponent},
            { path: 'landing-hackathon/:id', component: LandingHackathonDetailsComponent},
            { path: 'prize-form/:hackathonId', component: PrizeFormComponent },
            { path: 'landing-live-stream/:id', component: LiveStreamComponent },
            { path: 'sponsors-leaderboard', component: SponsorLeaderboardComponent },
            { path: 'sponsor-prizes', component: SponsorPrizesComponent },
            { path: 'sponsor-application-form', component: SponsorApplicationFormComponent },
            { path: 'mentor-applications/new', component: MentorApplicationFormComponent },
            { path: 'mentor-applications/user/:userId', component: MentorApplicationDetailsComponent },
            { path: 'mentor-applications/:id', component: MentorApplicationDetailsComponent },
            {  path: 'mentor-applications/:id/edit',  component: MentorApplicationFormComponent },
            { path: 'mentor-applications/:id/edit', component: MentorApplicationFormComponent },
            { path: 'mentor-evaluations-user', component: MentorEvaluationListUserComponent },
            { path: 'profile', component: UserProfileComponent },

            {
                path: 'landing/team-submission',
                component: LandingTeamSubmissionComponent
            },
            {
                path: 'landing/project-evaluation',
                component: LandingProjectEvaluationComponent
            },
            { path: 'mentor-form', component: ListMentorFormComponent },
            { path: 'mentor-evaluation/new', component: MentorEvaluationFormComponent },
            { path: 'mentor-evaluation/:id/edit', component: MentorEvaluationFormComponent },
            { path: 'team-chat-hub', component: TeamChatHubComponent },

            { path: 'pages/notfound', component: NotfoundComponent },
            { path: '**', redirectTo: 'pages/notfound' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
