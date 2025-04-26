import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamRoutingModule } from './team-routing.module';

// PrimeNG Components
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';

// Components
import { TeamListComponent } from './team-list/team-list.component';
import { TeamDetailsComponent } from './team-details/team-details.component';
import { TeamFormComponent } from './team-form/team-form.component';
import { TeamChatComponent } from './team-chat/team-chat.component';
import { TeamChatHubComponent } from './team-chat-hub/team-chat-hub.component';

@NgModule({
  declarations: [
    TeamListComponent,
    TeamDetailsComponent,
    TeamFormComponent,
    TeamChatComponent,
    TeamChatHubComponent
  ],
  imports: [
    CommonModule,
    TeamRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToggleButtonModule,
    DialogModule,
    DropdownModule,
    ProgressSpinnerModule,
    ToastModule,
    CardModule,
    InputTextareaModule,
    ChipModule,
    AvatarModule,
    AvatarGroupModule,
    BadgeModule,
    DividerModule,
    ConfirmDialogModule,
    TooltipModule,
    ChartModule,
    ProgressBarModule,
    SelectButtonModule,
    AccordionModule,
    AutoCompleteModule,
    SidebarModule,
    MenuModule,
    OverlayPanelModule
  ]
})
export class TeamModule { }
