import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Table } from 'primeng/table';
import { MentorEvaluation } from 'src/app/demo/models/mentor-evaluation.model';
import { MentorEvaluationService } from 'src/app/demo/services/mentor-evaluation.service';

@Component({
  selector: 'app-mentor-evaluation-list',
  templateUrl: './mentor-evaluation-list.component.html',
  styleUrls: ['./mentor-evaluation-list.component.scss']
  
})
export class MentorEvaluationListComponent implements OnInit {
  evaluations: MentorEvaluation[] = [];
  loading: boolean = true;

  constructor(
    private evaluationService: MentorEvaluationService,
    private router: Router,
    private messageService: MessageService
) {}

  ngOnInit(): void {
    this.evaluationService.getAllEvaluations().subscribe({
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
    this.router.navigate(['/mentor-evaluation-admin', id, 'edit']);
  }
}