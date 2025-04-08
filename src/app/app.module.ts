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
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent, MydashboardComponent, MentorApplicationListComponent, MentorApplicationDetailsComponent, MentorApplicationFormComponent, PreviousExperienceListComponent, PreviousExperienceFormComponent, MentorEvaluationListComponent, MentorEvaluationFormComponent, ListMentorListComponent, ListMentorFormComponent
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
        ToastModule,
        FormsModule,
        HttpClientModule,
        CardModule,
        TagModule,
        ProgressSpinnerModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
