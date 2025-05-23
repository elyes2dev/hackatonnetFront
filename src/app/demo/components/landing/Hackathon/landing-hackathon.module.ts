import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LandingHackathonListComponent } from './landing-hackathon-list/landing-hackathon-list.component';
import { LandingHackathonDetailsComponent } from './landing-hackathon-details/landing-hackathon-details.component';
import { LandingLiveStreamComponent } from './landing-live-stream/landing-live-stream.component';
import { LandingPostComponent } from './landing-hackathon-details/landing-post/landing-post.component';
import { LandingCommentComponent } from './landing-hackathon-details/landing-post/landing-comment/landing-comment.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { RatingModule } from 'primeng/rating';

import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { StyleClassModule } from 'primeng/styleclass';
import { DatePipe } from '@angular/common';
import { MentorDetailsDialogComponent } from './mentor-details-dialog/mentor-details-dialog.component';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

@NgModule({
  declarations: [
    LandingHackathonListComponent,
    LandingHackathonDetailsComponent,
    LandingLiveStreamComponent,
    LandingPostComponent,
    LandingCommentComponent,
    MentorDetailsDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    AvatarModule,
    ButtonModule,
    CardModule,
    InputTextareaModule,
    ToastModule,
    RatingModule,
    TooltipModule,
    RippleModule,
    AvatarModule,
    TooltipModule,
    DividerModule,
    CardModule,
    StyleClassModule
  ],
  exports: [
    LandingHackathonListComponent,
    LandingHackathonDetailsComponent,
    LandingLiveStreamComponent,
    LandingPostComponent,
    LandingCommentComponent
  ],
  providers: [
    DatePipe,
    DialogService, // Required for dynamic dialogs
    MessageService // Required for toast messages
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class LandingHackathonModule { }
