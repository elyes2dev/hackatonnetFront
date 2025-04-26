import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { StyleClassModule } from 'primeng/styleclass';
import { ChartModule } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG modules
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ProgressSpinnerModule,
    ToggleButtonModule,
    RippleModule,
    AvatarModule,
    AvatarGroupModule,
    ConfirmDialogModule,
    TooltipModule,
    InputTextareaModule,
    DialogModule,
    DividerModule,
    StyleClassModule,
    ChartModule,
    PanelModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG modules
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ProgressSpinnerModule,
    ToggleButtonModule,
    RippleModule,
    AvatarModule,
    AvatarGroupModule,
    ConfirmDialogModule,
    TooltipModule,
    InputTextareaModule,
    DialogModule,
    DividerModule,
    StyleClassModule,
    ChartModule,
    PanelModule
  ]
})
export class SharedModule { }
