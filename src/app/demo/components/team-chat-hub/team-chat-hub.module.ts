import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel';

// Components
import { TeamChatHubComponent } from './team-chat-hub.component';

@NgModule({
  declarations: [
    TeamChatHubComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: TeamChatHubComponent }
    ]),
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    ToastModule,
    AvatarModule,
    BadgeModule,
    DividerModule,
    TooltipModule,
    OverlayPanelModule
  ],
  exports: [
    TeamChatHubComponent
  ]
})
export class TeamChatHubModule { }
