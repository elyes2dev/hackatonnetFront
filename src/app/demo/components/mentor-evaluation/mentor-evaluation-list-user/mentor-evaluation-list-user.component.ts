import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Table } from 'primeng/table';
import { MentorEvaluation } from 'src/app/demo/models/mentor-evaluation.model';
import { MentorEvaluationService } from 'src/app/demo/services/mentor-evaluation.service';
import { StorageService } from 'src/app/demo/services/storage.service';

@Component({
  selector: 'app-mentor-evaluation-list-user',
  templateUrl: './mentor-evaluation-list-user.component.html',
  styleUrls: ['./mentor-evaluation-list-user.component.scss']
})
export class MentorEvaluationListUserComponent  implements OnInit {
  evaluations: MentorEvaluation[] = [];
  loading = true;

  constructor(
    private evaluationService: MentorEvaluationService,
    private router: Router,
    private messageService: MessageService,
    private storageService: StorageService // Inject StorageService
    
) {}


  ngOnInit(): void {
    const userId = this.storageService.getLoggedInUserId();

     // Get logged-in user ID
     if (!userId) {
       this.messageService.add({
         severity: 'error',
         summary: 'User Not Logged In',
         detail: 'You must be logged in to submit a mentor application.'
       });
       return;
     }
 
    this.evaluationService.getEvaluationsByMentorId(userId).subscribe({
      next: (data) => {
        this.evaluations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load evaluations', err);
        this.loading = false;
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    const input = (event.target as HTMLInputElement).value;
    table.filterGlobal(input, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  deleteEvaluation(id: number) {
    if (confirm('Are you sure you want to delete this evaluation?')) {
      this.evaluationService.deleteEvaluation(id).subscribe({
        next: () => {
          this.evaluations = this.evaluations.filter(e => e.id !== id);
          console.log(`Evaluation with ID ${id} deleted.`);
        },
        error: (err) => {
          console.error('Failed to delete evaluation:', err);
        }
      });
    }
  }


   editEvaluation(id: number) {
    this.router.navigate(['/mentor-evaluation', id, 'edit']);
  }

}
