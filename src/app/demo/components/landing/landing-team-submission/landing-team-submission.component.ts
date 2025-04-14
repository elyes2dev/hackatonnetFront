import { Component, OnInit } from '@angular/core';
import { TeamSubmissionService } from '../../../service/team-submission.service';
import { TeamSubmission } from '../../../api/team-submission';

@Component({
  selector: 'app-landing-team-submission',
  templateUrl: './landing-team-submission.component.html',
  styleUrls: ['./landing-team-submission.component.scss']
})
export class LandingTeamSubmissionComponent implements OnInit {
  submissions: TeamSubmission[] = [];
  loading: boolean = false;
  error: string | null = null;
  selectedSubmission: TeamSubmission | null = null;

  newSubmission: TeamSubmission = {
    projectName: '',
    description: '',
    repoLink: '',
    teamMember: { id: 0 }
  };

  constructor(private teamSubmissionService: TeamSubmissionService) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.loading = true;
    this.error = null;
    this.teamSubmissionService.getAllSubmissions().subscribe({
      next: (data) => {
        this.submissions = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des soumissions : ' + (err.message || 'Erreur réseau');
        this.loading = false;
      }
    });
  }

  createSubmission(): void {
    this.loading = true;
    this.teamSubmissionService.createSubmission(this.newSubmission).subscribe({
      next: (response) => {
        alert('Soumission créée avec succès !');
        this.newSubmission = {
          projectName: '',
          description: '',
          repoLink: '',
          teamMember: { id: 0 }
        };
        this.loadSubmissions();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la création : ' + (err.message || 'Erreur réseau');
        this.loading = false;
      }
    });
  }

  selectSubmission(submission: TeamSubmission): void {
    this.selectedSubmission = { ...submission };
  }

  updateSubmission(): void {
    if (this.selectedSubmission && this.selectedSubmission.id) {
      this.teamSubmissionService.updateSubmission(this.selectedSubmission.id, this.selectedSubmission).subscribe({
        next: () => {
          alert('Soumission mise à jour avec succès !');
          this.selectedSubmission = null;
          this.loadSubmissions();
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour : ' + (err.message || 'Erreur réseau');
        }
      });
    }
  }

  delete(id: number): void {
    if (id == null || id === undefined) {
      this.error = 'L\'ID de la soumission est invalide.';
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cette soumission ?')) {
      this.teamSubmissionService.deleteSubmission(id).subscribe({
        next: () => {
          this.loadSubmissions();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression : ' + (err.message || 'Erreur réseau');
        }
      });
    }
  }

  cancelModification(): void {
    this.selectedSubmission = null;
  }
}