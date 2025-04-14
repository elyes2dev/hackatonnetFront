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
import { ProjectEvaluationService } from './demo/service/project-evaluation.service'; // Ajout
import { TeamSubmissionService } from './demo/service/team-submission.service'; // Ajout

// Imports existants
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
import { TeamSubmissionComponent } from './demo/components/team-submission/team-submission.component';
import { ProjectEvaluationComponent } from './demo/components/project-evaluation/project-evaluation.component';
import { PaymentComponent } from './components/payment/payment.component';
import { ComponentsComponent } from './components/components.component';

@NgModule({
  declarations: [
    AppComponent,
    NotfoundComponent,
    MydashboardComponent,
    TeamSubmissionComponent,
    ProjectEvaluationComponent,
    PaymentComponent,
    ComponentsComponent,
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
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    CountryService, CustomerService, EventService, IconService, NodeService,
    PhotoService, ProductService,
    ProjectEvaluationService, // Ajouté
    TeamSubmissionService     // Ajouté
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }