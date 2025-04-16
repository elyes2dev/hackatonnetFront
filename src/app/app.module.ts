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
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ChartModule } from 'primeng/chart';
import { PrimeIcons } from 'primeng/api';

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


@NgModule({
    declarations: [
        AppComponent, NotfoundComponent, MydashboardComponent, HackathonDetailsComponent, HackathonListComponent, HackathonFormComponent, PostListComponent, CommentListComponent, PostFormComponent, LiveStreamComponent, VideoRoomComponent, HackathonAnalyticsComponent, HackathonCategorizationAnalyticsComponent
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
        InputTextModule,
        InputTextareaModule,
        ButtonModule,
        ToastModule,
        ChartModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
