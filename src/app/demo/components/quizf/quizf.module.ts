import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuizfRoutingModule } from './quizf-routing.module';
import { QuizfScoreAddComponent } from './quizf-score-add/quizf-score-add.component';
import { QuizfDetailsComponent } from './quizf-details/quizf-details.component';
import { QuizfResultDialogComponent } from './quizf-result-dialog/quizf-result-dialog.component';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

@NgModule({
    declarations: [
        QuizfScoreAddComponent,
        QuizfDetailsComponent,
        QuizfResultDialogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        QuizfRoutingModule,
        ButtonModule,
        CardModule,
        ProgressSpinnerModule,
        ToastModule,
        DialogModule,
        DynamicDialogModule
    ]
})
export class QuizfModule { } 