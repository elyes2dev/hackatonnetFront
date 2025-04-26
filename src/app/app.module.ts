import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { TeamFrontofficeModule } from './demo/components/team-frontoffice/team-frontoffice.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserProfileComponent } from './demo/components/user-profile/user-profile.component';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { SidebarModule } from 'primeng/sidebar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ChartModule } from 'primeng/chart';
import { PrimeIcons } from 'primeng/api';
import { ProjectEvaluationService } from './demo/service/project-evaluation.service'; // Ajout
import { TeamSubmissionService } from './demo/service/team-submission.service'; // Ajout


//New TODO mydasboard
import { MydashboardComponent } from './demo/components/mydashboard/mydashboard.component';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { WorkshoplistComponent } from './demo/components/workshop/workshoplist/workshoplist.component';
import { HttpClientModule } from '@angular/common/http';
import { WorkshopService } from './demo/services/workshop.service';
import { BrowserModule } from '@angular/platform-browser';
import { WorkshopFormComponent } from './demo/components/workshop/workshop-form/workshop-form.component';
import { WorkshopDetailsComponent } from './demo/components/workshop/workshop-details/workshop-details.component';
import { UserComponent } from './demo/components/user/user.component';
import { QuizDetailsComponent } from './demo/components/quiz/quiz-details/quiz-details.component';
import { QuizFormComponent } from './demo/components/quiz/quiz-form/quiz-form.component';
import { QuizListComponent } from './demo/components/quiz/quiz-list/quiz-list.component';
import { QuizResultDialogComponent } from './demo/components/quiz/quiz-result-dialog/quiz-result-dialog.component';
import { QuizScoreAddComponent } from './demo/components/quiz/quiz-score-add/quiz-score-add.component';
import { RouterModule } from '@angular/router';
import { ResourceDetailsComponent } from './demo/components/resource/resource-details/resource-details.component';
import { ResourceListComponent } from './demo/components/resource/resource-list/resource-list.component';
import { ResourceFormComponent } from './demo/components/resource/resource-form/resource-form.component';
import { SupportTicketComponent } from './demo/components/ticket/support-ticket.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MentorApplicationListComponent } from './demo/components/mentor-application/mentor-application-list/mentor-application-list.component';
import { MentorApplicationDetailsComponent } from './demo/components/mentor-application/mentor-application-details/mentor-application-details.component';
import { MentorApplicationFormComponent } from './demo/components/mentor-application/mentor-application-form/mentor-application-form.component';
import { PreviousExperienceListComponent } from './demo/components/previous-experience/previous-experience-list/previous-experience-list.component';
import { PreviousExperienceFormComponent } from './demo/components/previous-experience/previous-experience-form/previous-experience-form.component';
import { MentorEvaluationListComponent } from './demo/components/mentor-evaluation/mentor-evaluation-list/mentor-evaluation-list.component';
import { MentorEvaluationFormComponent } from './demo/components/mentor-evaluation/mentor-evaluation-form/mentor-evaluation-form.component';
import { ListMentorListComponent } from './demo/components/list-mentor/list-mentor-list/list-mentor-list.component';
import { ListMentorFormComponent } from './demo/components/list-mentor/list-mentor-form/list-mentor-form.component';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
// Include this in your module imports
import { CarouselModule } from 'primeng/carousel';
// PrimeNG Modules
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { CalendarModule } from 'primeng/calendar';
import { FooterComponent } from './demo/components/landing/footer/footer.component';
import { NavbarComponent } from './demo/components/landing/navbar/navbar.component';
import { MentorApplicationDetailsAdminComponent } from './demo/components/mentor-application/mentor-application-details-admin/mentor-application-details-admin.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MentorEvaluationFormAdminComponent } from './demo/components/mentor-evaluation/mentor-evaluation-form-admin/mentor-evaluation-form-admin.component';
import { ListMentorFormAdminComponent } from './demo/components/list-mentor/list-mentor-form-admin/list-mentor-form-admin.component';
import { MentorEvaluationListUserComponent } from './demo/components/mentor-evaluation/mentor-evaluation-list-user/mentor-evaluation-list-user.component';
import { TooltipModule } from 'primeng/tooltip';

import { WorkshoplistfComponent } from './demo/components/workshopf/workshoplistf/workshoplistf.component';
import { WorkshopfFormComponent } from './demo/components/workshopf/workshopf-form/workshopf-form.component';
import { WorkshopfDetailsComponent } from './demo/components/workshopf/workshopf-details/workshopf-details.component';
import { ResourcefListComponent } from './demo/components/resourcef/resourcef-list/resourcef-list.component';
import { ResourcefFormComponent } from './demo/components/resourcef/resourcef-form/resourcef-form.component';
import { ResourcefDetailsComponent } from './demo/components/resourcef/resourcef-details/resourcef-details.component';
import { QuizfListComponent } from './demo/components/quizf/quizf-list/quizf-list.component';
import { QuizfFormComponent } from './demo/components/quizf/quizf-form/quizf-form.component';
import { QuizfDetailsComponent } from './demo/components/quizf/quizf-details/quizf-details.component';
import { QuizfResultDialogComponent } from './demo/components/quizf/quizf-result-dialog/quizf-result-dialog.component';
import { QuizfScoreAddComponent } from './demo/components/quizf/quizf-score-add/quizf-score-add.component';
import { FilterByNameAndThemePipe } from './demo/components/workshopf/workshoplistf/filter-by-name-and-theme.pipe';
import { ChartsComponent } from './demo/components/charts/charts.component';
import { NgChartsModule } from 'ng2-charts';
import { SponsorApplicationFormComponent } from './demo/components/sponsor/sponsor-application-form/sponsor-application-form.component';
import { SponsorApplicationDetailComponent } from './demo/components/sponsor/sponsor-application-detail/sponsor-application-detail.component';
import { SponsorApplicationListComponent } from './demo/components/sponsor/sponsor-application-list/sponsor-application-list.component';
import { PrizeFormComponent } from './demo/components/prize/prize-form/prize-form.component';
import { PrizeListComponent } from './demo/components/prize/prize-list/prize-list.component';
import { PrizeDetailComponent } from './demo/components/prize/prize-detail/prize-detail.component';
import { SponsorLeaderboardComponent } from './demo/components/sponsor/sponsor-leaderboard/sponsor-leaderboard.component';
import { SponsorPrizesComponent } from './demo/components/prize/sponsor-prizes/sponsor-prizes.component';
import { HackathonDetailsComponent } from './demo/components/hackathons/hackathon-details/hackathon-details.component';
import { HackathonListComponent } from './demo/components/hackathons/hackathon-list/hackathon-list/hackathon-list.component';
import { HackathonFormComponent } from './demo/components/hackathons/hackathon-form/hackathon-form.component';
import { DialogModule } from 'primeng/dialog';
import { PostListComponent } from './demo/components/posts/post-list/post-list.component';
import { CommentListComponent } from './demo/components/comment/comment-list/comment-list.component';
import { PostFormComponent } from './demo/components/posts/post-form/post-form/post-form.component';
import { LiveStreamComponent } from './demo/components/live-stream/live-stream/live-stream.component';
import { VideoRoomComponent } from './demo/components/live-stream/video-room/video-room.component';
import { HackathonAnalyticsComponent } from './demo/components/Analytics/hackathon-analytics/hackathon-analytics.component';
import { HackathonCategorizationAnalyticsComponent } from './demo/components/Analytics/hackathon-categorization-analytics/hackathon-categorization-analytics.component';
import { HackathonInsightsComponent } from './demo/components/Analytics/hackathon-insights/hackathon-insights/hackathon-insights.component';
import { AiQuizDialogComponent } from './demo/components/quiz/quiz-list/ai-quiz-dialog/ai-quiz-dialog.component';
import { AccessDeniedComponent } from './demo/components/hackathons/hackathon-list/access-denied/access-denied.component';
import { TeamSubmissionComponent } from './demo/components/team-submission/team-submission.component';
import { ProjectEvaluationComponent } from './demo/components/project-evaluation/project-evaluation.component';
import { PaymentComponent } from './components/payment/payment.component';
import { ComponentsComponent } from './components/components.component';
import {LandingModule} from "./demo/components/landing/landing.module";
import {
    LandingTeamSubmissionComponent
} from "./demo/components/landing/landing-team-submission/landing-team-submission.component";
import {
    LandingProjectEvaluationComponent
} from "./demo/components/landing/landing-project-evaluation/landing-project-evaluation.component";
import { MessageModule } from 'primeng/message';
import { TeamFrontofficeComponent } from './demo/components/team-frontoffice/team-frontoffice.component';
import { TeamChatHubModule } from './demo/components/team-chat-hub/team-chat-hub.module';
import { FacialMetricsComponent } from './demo/components/live-stream/video-room/facial-metrics/facial-metrics.component';
import { FacialAnalysisService } from './demo/services/live-stream/facial-analysis/facial-analysis.service';
import { GeneralComponent } from './demo/components/general/general.component';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { PasswordModule } from 'primeng/password';





@NgModule({
    declarations: [
        AppComponent,
        // TeamfrontDetailsComponent removed to avoid duplicate declaration,
        NotfoundComponent, 
        WorkshoplistComponent, 
        WorkshopFormComponent, 
        WorkshopDetailsComponent, 
        ResourceListComponent, 
        ResourceFormComponent, 
        ResourceDetailsComponent, 
        QuizListComponent, 
        QuizFormComponent, 
        QuizDetailsComponent, 
        QuizScoreAddComponent, 
        QuizResultDialogComponent, 
        WorkshoplistfComponent, 
        NavbarComponent, 
        FooterComponent, 
        WorkshopfFormComponent, 
        WorkshopfDetailsComponent, 
        ResourcefListComponent, 
        ResourcefFormComponent, 
        ResourcefDetailsComponent, 
        QuizfListComponent, 
        QuizfFormComponent, 
        QuizfDetailsComponent, 
        QuizfResultDialogComponent, 
        QuizfScoreAddComponent, 
        FilterByNameAndThemePipe, 
        ChartsComponent
          , 
        WorkshoplistComponent, 
        WorkshopFormComponent, 
        WorkshopDetailsComponent, 
        UserComponent, 
        QuizDetailsComponent, 
        QuizFormComponent, 
        QuizListComponent, 
        QuizResultDialogComponent, 
        QuizScoreAddComponent ,
        ResourceDetailsComponent, 
        WorkshoplistComponent,ResourceListComponent,ResourceFormComponent,SupportTicketComponent,SponsorApplicationFormComponent,
        SponsorApplicationListComponent,
        SponsorApplicationDetailComponent,
        PrizeFormComponent,
        PrizeListComponent,
        PrizeDetailComponent,
        SponsorLeaderboardComponent,
        SponsorPrizesComponent,  MentorApplicationDetailsAdminComponent,
        MentorEvaluationFormAdminComponent,
         MentorApplicationListComponent, MentorApplicationDetailsComponent, MentorApplicationFormComponent, PreviousExperienceListComponent, PreviousExperienceFormComponent, MentorEvaluationListComponent, MentorEvaluationFormComponent, ListMentorListComponent, ListMentorFormComponent,
        ListMentorFormAdminComponent,
        MentorEvaluationListUserComponent,

        MydashboardComponent,
        UserProfileComponent,
        HackathonDetailsComponent, HackathonListComponent, HackathonFormComponent, PostListComponent, CommentListComponent, PostFormComponent, LiveStreamComponent, VideoRoomComponent, HackathonAnalyticsComponent, HackathonCategorizationAnalyticsComponent, HackathonInsightsComponent,
        AiQuizDialogComponent,    TeamSubmissionComponent,
        ProjectEvaluationComponent,
        PaymentComponent,
        ComponentsComponent,
        AccessDeniedComponent,
        FacialMetricsComponent,
        GeneralComponent,

        FooterComponent,
        SponsorPrizesComponent

        

    ],
    imports: [
        AppRoutingModule,
        AvatarGroupModule,
        AppLayoutModule,
        TeamFrontofficeModule,
        TeamChatHubModule,
        TableModule,
        CarouselModule,
        CommonModule,
        ReactiveFormsModule,
        RatingModule,
        ButtonModule,
        SliderModule,
        InputTextModule,
        ToggleButtonModule,
        RippleModule,
        DialogModule,
        DynamicDialogModule,
        ToastModule,
        MultiSelectModule,
        DropdownModule,
        ProgressBarModule,
        MessageModule, // Add MessageModule to the imports array

        ConfirmDialogModule,
        ToastModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        NgChartsModule,
        FileUploadModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        CardModule,
        TagModule,
        ProgressSpinnerModule,
        ToastModule,
        TooltipModule,
        AvatarModule, // Add AvatarModule here
        BadgeModule,
        ReactiveFormsModule,
        SidebarModule,
        ConfirmDialogModule,
        DialogModule,
        ButtonModule,
        FileUploadModule,
        CommonModule,
        FileUploadModule,
        ToastModule,
        ChartModule,
        ProgressSpinnerModule,

        // PrimeNG Modules
        InputTextModule,
        InputTextareaModule,
        ButtonModule,
        CheckboxModule,
        FileUploadModule,
        CalendarModule,
        RippleModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        RippleModule,
        RippleModule,
        BrowserAnimationsModule,
        MessageModule,
        AccordionModule,
        DynamicDialogModule,
        PanelModule,
        PasswordModule,       // ✅ Required for <p-password>
        CalendarModule,
        TagModule,
        TableModule,
        DropdownModule,
        ReactiveFormsModule,
        

    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService, WorkshopService, ProductService, ConfirmationService, MessageService,
        ProjectEvaluationService, // Ajouté
        TeamSubmissionService, FacialAnalysisService

    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
