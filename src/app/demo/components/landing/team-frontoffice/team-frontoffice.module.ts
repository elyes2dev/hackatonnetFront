import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamFrontofficeRoutingModule } from './team-frontoffice-routing.module';
import { TeamConversationComponent } from './team/team-conversation/team-conversation.component';
import { HackathonListComponent } from './team/hackathon-list/hackathon-list.component';
import { TeamUpdateComponent } from './team/team-update/team-update.component';
import { TeamCreateComponent } from './team/team-create/team-create.component';
import { TeamListComponent } from './team/team-list/team-list.component';
import { TeamJoinComponent } from './team/team-join/team-join.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { MemberCreateComponent } from './members/member-create/member-create.component';
import { MemberUpdateComponent } from './members/member-update/member-update.component';
import { DiscussionListComponent } from './discussion/discussion-list/discussion-list.component';
import { DiscussionCreateComponent } from './discussion/discussion-create/discussion-create.component';
import { DiscussionUpdateComponent } from './discussion/discussion-update/discussion-update.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


@NgModule({
  declarations: [
    TeamConversationComponent,
    HackathonListComponent,
    TeamUpdateComponent,
    TeamCreateComponent,
    TeamListComponent,
    TeamJoinComponent,
    MemberListComponent,
    MemberCreateComponent,
    MemberUpdateComponent,
    DiscussionListComponent,
    DiscussionCreateComponent,
    DiscussionUpdateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TeamFrontofficeRoutingModule,
    NavbarComponent,
    FooterComponent,
    ProgressSpinnerModule
  ]
})
export class TeamFrontofficeModule { }
