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
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkshoplistComponent } from './demo/components/workshop/workshoplist/workshoplist.component';
import { WorkshopFormComponent } from './demo/components/workshop/workshop-form/workshop-form.component';
import { WorkshopDetailsComponent } from './demo/components/workshop/workshop-details/workshop-details.component';
import { ResourceListComponent } from './demo/components/resource/resource-list/resource-list.component';
import { ResourceFormComponent } from './demo/components/resource/resource-form/resource-form.component';
import { ResourceDetailsComponent } from './demo/components/resource/resource-details/resource-details.component';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { QuizListComponent } from './demo/components/quiz/quiz-list/quiz-list.component';
import { QuizFormComponent } from './demo/components/quiz/quiz-form/quiz-form.component';
import { QuizDetailsComponent } from './demo/components/quiz/quiz-details/quiz-details.component';
import { QuizScoreAddComponent } from './demo/components/quiz/quiz-score-add/quiz-score-add.component';
import { QuizResultDialogComponent } from './demo/components/quiz/quiz-result-dialog/quiz-result-dialog.component';

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent, MydashboardComponent, WorkshoplistComponent, WorkshopFormComponent, WorkshopDetailsComponent, ResourceListComponent, ResourceFormComponent, ResourceDetailsComponent, QuizListComponent, QuizFormComponent, QuizDetailsComponent, QuizScoreAddComponent, QuizResultDialogComponent
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
        ReactiveFormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        InputTextModule,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
