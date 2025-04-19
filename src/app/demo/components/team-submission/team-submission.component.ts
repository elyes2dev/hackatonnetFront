import { Component, OnInit } from '@angular/core';
import { TeamSubmissionService } from '../../service/team-submission.service';
import { TeamSubmission } from '../../api/team-submission';

@Component({
  selector: 'app-team-submission',
  templateUrl: './team-submission.component.html',
  styleUrls: ['./team-submission.component.scss']

})
export class TeamSubmissionComponent implements OnInit {

  submissions: TeamSubmission[] = [];
  loading: boolean = false; // Variable pour indiquer si les données sont en cours de chargement
  error: string | null = null; // Variable pour gérer les erreurs

  // Nouvelle soumission temporaire à remplir depuis le formulaire
  newSubmission: any = {
    projectName: '',
    description: '',
    repoLink: '',
    teamMember: {
      id: null
    }
  };

  // Variable pour stocker la soumission sélectionnée à modifier
  editSubmission: any = null;

  constructor(private teamSubmissionService: TeamSubmissionService) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  // Méthode pour charger toutes les soumissions
  loadSubmissions(): void {
    this.loading = true; // Démarrer le chargement
    this.error = null; // Réinitialiser l'erreur à chaque nouvelle tentative

    this.teamSubmissionService.getAllSubmissions().subscribe(
      data => {
        this.submissions = data;
        this.loading = false; // Arrêter le chargement une fois les données reçues
      },
      error => {
        this.error = 'Erreur lors du chargement des soumissions. Veuillez réessayer.'; // Afficher l'erreur en cas de problème
        this.loading = false; // Arrêter le chargement même en cas d'erreur
      }
    );
  }

  // Méthode pour supprimer une soumission
  delete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette soumission ?')) {
      this.teamSubmissionService.deleteSubmission(id).subscribe(
        () => {
          this.loadSubmissions(); // Recharger les soumissions après suppression
        },
        error => {
          this.error = 'Erreur lors de la suppression de la soumission. Veuillez réessayer.';
        }
      );
    }
  }

  // Méthode pour créer une nouvelle soumission
  createSubmission(): void {
    this.teamSubmissionService.createSubmission(this.newSubmission).subscribe({
      next: (response) => {
        alert('Soumission créée avec succès !');
        // Réinitialise le formulaire après création
        this.newSubmission = {
          projectName: '',
          description: '',
          repoLink: '',
          teamMember: { id: null }
        };
        this.loadSubmissions(); // Recharge les données
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'ajout de la soumission");
      }
    });
  }

  // Méthode pour charger une soumission à modifier
  edit(id: number): void {
    const submissionToEdit = this.submissions.find(submission => submission.id === id);
    if (submissionToEdit) {
      this.editSubmission = { ...submissionToEdit }; // Crée une copie de la soumission à modifier
    }
  }

  // Méthode pour enregistrer la soumission modifiée
  updateSubmission(): void {
    if (this.editSubmission) {
      const id = this.editSubmission.id; // Récupère l'ID de la soumission à modifier
      this.teamSubmissionService.updateSubmission(id, this.editSubmission).subscribe({
        next: (response) => {
          alert('Soumission mise à jour avec succès !');
          this.editSubmission = null; // Réinitialise le formulaire de modification
          this.loadSubmissions(); // Recharge les données
        },
        error: (err) => {
          console.error(err);
          alert("Erreur lors de la mise à jour de la soumission");
        }
      });
    }
  }
  
}
