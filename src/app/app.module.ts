import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { AppComponent } from './app.component';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { MydashboardComponent } from './demo/components/mydashboard/mydashboard.component';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { LandingModule } from './demo/components/landing/landing.module';
import { TeamModule } from './demo/components/team/team.module';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { MessageService } from 'primeng/api';

// Services
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { HackathonListComponent } from './demo/components/hackathons/hackathon-list/hackathon-list/hackathon-list.component';
import { HackathonDetailsComponent } from './demo/components/hackathons/hackathon-details/hackathon-details.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu'; // Added
import { TooltipModule } from 'primeng/tooltip'; // Added for pTooltip
import { InputTextareaModule } from 'primeng/inputtextarea'; // Added for textarea
import { FileUploadModule } from 'primeng/fileupload'; // Added for file upload

@NgModule({
    declarations: [
        AppComponent,
        NotfoundComponent,
        HackathonListComponent,
        HackathonDetailsComponent
    ],
    imports: [
        // Angular Modules
     
        HttpClientModule,
        CommonModule,
        FormsModule,
        RouterModule,
        
        // App Modules
        AppRoutingModule,
        AppLayoutModule,
        TeamModule,
        LandingModule,

        // PrimeNG Modules
        TableModule,
        ToastModule,
        ButtonModule,
        SidebarModule,
        RippleModule,
        InputTextModule,
        ToggleButtonModule,
        MultiSelectModule,
        DropdownModule,
        ProgressBarModule,
        SliderModule,
        RatingModule,
        ProgressSpinnerModule,
        MenuModule,
        TooltipModule,
        InputTextareaModule,
        FileUploadModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        MessageService,  // Add MessageService here
        CountryService,
        CustomerService,
        EventService,
        IconService,
        NodeService,
        PhotoService,
        ProductService,
        AuthService,
        DialogService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }