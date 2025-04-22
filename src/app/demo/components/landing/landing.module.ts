import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
import { StyleClassModule } from 'primeng/styleclass';
import { DividerModule } from 'primeng/divider';
import { ChartModule } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';

import { LandingHackathonListComponent } from './Hackathon/landing-hackathon-list/landing-hackathon-list.component';
import { LandingHackathonDetailsComponent } from './Hackathon/landing-hackathon-details/landing-hackathon-details.component';
import { AvatarModule } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { AppModule } from 'src/app/app.module';
import { LandingLiveStreamComponent } from './Hackathon/landing-live-stream/landing-live-stream.component';
import { LandingPostComponent } from './Hackathon/landing-hackathon-details/landing-post/landing-post.component';
import { LandingCommentComponent } from './Hackathon/landing-hackathon-details/landing-post/landing-comment/landing-comment.component';
import { RippleModule } from 'primeng/ripple';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { LandingProjectEvaluationComponent } from './landing-project-evaluation/landing-project-evaluation.component'; // Nouveau
import { LandingTeamSubmissionComponent } from './landing-team-submission/landing-team-submission.component'; // Nouveau


@NgModule({
    imports: [
        CommonModule,
        LandingRoutingModule,
        DividerModule,
        StyleClassModule,
        ChartModule,
        PanelModule,
        ButtonModule,
        AvatarModule,
        FormsModule,
        DropdownModule,
        InputTextModule,
        RippleModule,
        InputTextModule,
        InputTextareaModule,
        ToastModule

    ],
    declarations: [LandingComponent, LandingHackathonListComponent, LandingHackathonDetailsComponent, LandingLiveStreamComponent, LandingPostComponent, LandingCommentComponent]
})
export class LandingModule { }
