import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { FileUploadModule } from 'primeng/fileupload'; // Added for file upload
import { CardModule } from 'primeng/card'; // Added for statistics cards
import { ChartModule } from 'primeng/chart'; // Added for statistics charts
import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { TeamRoutingModule } from './team-routing.module';
import { GetAllTeamsComponent } from './team/get-all-teams/get-all-teams.component';
import { CreateTeamComponent } from './team/create-team/create-team.component';
import { UpdateTeamComponent } from './team/update-team/update-team.component';
import { LeaveTeamComponent } from './team/leave-team/leave-team.component';
import { JoinTeamComponent } from './team/join-team/join-team.component';
import { TeamMembersComponent } from './members/team-members/team-members.component';
import { TeamFrontofficeComponent } from '../team-frontoffice/team-frontoffice.component';

@NgModule({
  declarations: [
    GetAllTeamsComponent,
    JoinTeamComponent,
    LeaveTeamComponent,
    UpdateTeamComponent,
    CreateTeamComponent,
    TeamMembersComponent,
    TeamFrontofficeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ToolbarModule,
    DialogModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    ToggleButtonModule,
    RippleModule,
    MultiSelectModule,
    DropdownModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    TableModule,
    CheckboxModule,
    TagModule,
    TooltipModule,
    MenuModule,
    TeamRoutingModule,
    FileUploadModule,
    CardModule, // Added for statistics cards
    ChartModule, // Added for statistics charts
    PickerModule,
  ],
  exports: [
    GetAllTeamsComponent,
    JoinTeamComponent,
    LeaveTeamComponent,
    UpdateTeamComponent,
    CreateTeamComponent,
    TeamMembersComponent,
    PickerModule,
  ]
})
export class TeamModule {}