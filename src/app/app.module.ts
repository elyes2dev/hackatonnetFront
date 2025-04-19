import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
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
import { DialogService } from 'primeng/dynamicdialog';

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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
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
import { FileUploadModule } from 'primeng/fileupload';
import {CardModule} from "primeng/card";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SponsorApplicationFormComponent } from './demo/components/sponsor/sponsor-application-form/sponsor-application-form.component';
import { SponsorApplicationDetailComponent } from './demo/components/sponsor/sponsor-application-detail/sponsor-application-detail.component';
import { SponsorApplicationListComponent } from './demo/components/sponsor/sponsor-application-list/sponsor-application-list.component';
import { PrizeFormComponent } from './demo/components/prize/prize-form/prize-form.component';
import { PrizeListComponent } from './demo/components/prize/prize-list/prize-list.component';
import { PrizeDetailComponent } from './demo/components/prize/prize-detail/prize-detail.component';
import { SponsorLeaderboardComponent } from './demo/components/sponsor/sponsor-leaderboard/sponsor-leaderboard.component';
import { SponsorPrizesComponent } from './demo/components/prize/sponsor-prizes/sponsor-prizes.component';
import { NavbarComponent } from './demo/components/landing/navbar/navbar.component';
import { FooterComponent } from './demo/components/landing/footer/footer.component';
import { AiQuizDialogComponent } from './demo/components/quiz/quiz-list/ai-quiz-dialog/ai-quiz-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageModule } from 'primeng/message';
import { AccordionModule } from 'primeng/accordion';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { QuizService } from './demo/services/quiz.service';

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent, MydashboardComponent, WorkshoplistComponent, WorkshopFormComponent, WorkshopDetailsComponent, ResourceListComponent, ResourceFormComponent, ResourceDetailsComponent, QuizListComponent, QuizFormComponent, QuizDetailsComponent, QuizScoreAddComponent, QuizResultDialogComponent, WorkshoplistfComponent, NavbarComponent, FooterComponent, WorkshopfFormComponent, WorkshopfDetailsComponent, ResourcefListComponent, ResourcefFormComponent, ResourcefDetailsComponent, QuizfListComponent, QuizfFormComponent, QuizfDetailsComponent, QuizfResultDialogComponent, QuizfScoreAddComponent, FilterByNameAndThemePipe, ChartsComponent
          ,MydashboardComponent, WorkshoplistComponent, WorkshopFormComponent, WorkshopDetailsComponent, UserComponent, QuizDetailsComponent, QuizFormComponent, QuizListComponent, QuizResultDialogComponent, QuizScoreAddComponent ,
        ResourceDetailsComponent, WorkshoplistComponent,ResourceListComponent,ResourceFormComponent,SupportTicketComponent,SponsorApplicationFormComponent,
        SponsorApplicationListComponent,
        SponsorApplicationDetailComponent,
        PrizeFormComponent,
        PrizeListComponent,
        PrizeDetailComponent,
        SponsorLeaderboardComponent,
        SponsorPrizesComponent,
        AiQuizDialogComponent
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        TableModule,
        CommonModule,
        RatingModule,
        ButtonModule,
        SliderModule,
        InputTextModule,
        ToggleButtonModule,
        RippleModule,
        MultiSelectModule,
        DropdownModule,
        ProgressBarModule,
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
        BrowserAnimationsModule,
        MessageModule,
        AccordionModule,
        DynamicDialogModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService, WorkshopService, ProductService, ConfirmationService, MessageService,
        QuizService,
        DialogService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
