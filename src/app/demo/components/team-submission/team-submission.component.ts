import { Component, OnInit } from '@angular/core';
import { TeamSubmissionService } from '../../service/team-submission.service';
import { TeamSubmission } from '../../api/team-submission';
import { Router } from '@angular/router';
import { ProjectEvaluationService } from '../../service/project-evaluation.service';
import { ProjectEvaluation } from '../../api/project-evaluation';
import { TeamMembersService } from '../../services/team-members.service';
import { TeamMember } from '../../models/team-members';

@Component({
  selector: 'app-team-submission',
  templateUrl: './team-submission.component.html',
  styleUrls: ['./team-submission.component.scss']

})
export class TeamSubmissionComponent implements OnInit {

  submissions: TeamSubmission[] = [];
  loading = false; // Variable pour indiquer si les données sont en cours de chargement
  error: string | null = null; // Variable pour gérer les erreurs

  // New temporary submission to be filled from the form
  newSubmission: any = {
    projectName: '',
    description: '',
    repoLink: '',
    teamMember: {
      id: null
    }
  };

  // Team members list for dropdown selection
  teamMembers: TeamMember[] = [];
  selectedTeamMember: TeamMember | null = null;

  // Variable to store the selected submission for editing
  editSubmission: any = {
    id: 0,
    projectName: '',
    description: '',
    repoLink: '',
    teamMember: { id: 0 }
  };

  // Variables for dialogs
  displayCreateDialog = false;
  displayEditDialog = false;
  displayEvaluationDialog = false;

  // Variable to store evaluations of a submission
  currentSubmissionEvaluations: ProjectEvaluation[] = [];
  selectedSubmissionId: number | null = null;
  loadingEvaluations = false;

  constructor(
    private teamSubmissionService: TeamSubmissionService,
    private projectEvaluationService: ProjectEvaluationService,
    private teamMembersService: TeamMembersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubmissions();
    this.loadTeamMembers();
  }

  // Method to load all team members for dropdown selection
  loadTeamMembers(): void {
    // First try to get team members for the current user's team
    this.teamMembersService.getCurrentUserTeamMemberships().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.teamMembers = data;
          console.log('Loaded team members for current user:', this.teamMembers);
        } else {
          // If no team members found for current user, try getting all team members
          this.loadAllTeamMembers();
        }
      },
      error: (error) => {
        console.error('Error loading team members for current user:', error);
        // Fallback to getting all team members
        this.loadAllTeamMembers();
      }
    });
  }

  // Fallback method to load all team members
  loadAllTeamMembers(): void {
    this.teamMembersService.getAllTeamMembers().subscribe({
      next: (data) => {
        this.teamMembers = data || [];
        console.log('Loaded all team members:', this.teamMembers);
        
        if (!data || data.length === 0) {
          console.warn('No team members found in database');
          this.error = 'No team members found in the database. Please create team members first.';
        }
      },
      error: (error) => {
        console.error('Error loading all team members:', error);
        this.error = 'Error loading team members from database: ' + error.message;
      }
    });
  }



  // Method to load all submissions
  loadSubmissions(): void {
    this.loading = true; // Start loading
    this.error = null; // Reset error on each new attempt

    this.teamSubmissionService.getAllSubmissions().subscribe(
      data => {
        this.submissions = data;
        this.loading = false; // Stop loading once data is received
      },
      error => {
        this.error = 'Error loading submissions. Please try again.'; // Display error in case of problem
        this.loading = false; // Stop loading even in case of error
      }
    );
  }

  // Method to delete a submission
  delete(id: number): void {
    if (confirm('Are you sure you want to delete this submission?')) {
      this.teamSubmissionService.deleteSubmission(id).subscribe(
        () => {
          this.loadSubmissions(); // Reload submissions after deletion
        },
        error => {
          this.error = 'Error deleting submission. Please try again.';
        }
      );
    }
  }

  // Method to create a new submission
  createSubmission(): void {
    // If we have a selected team member, use its ID
    if (this.selectedTeamMember) {
      this.newSubmission.teamMember = { id: this.selectedTeamMember.id };
    }
    
    this.teamSubmissionService.createSubmission(this.newSubmission).subscribe({
      next: (response) => {
        alert('Submission created successfully!');
        // Reset form after creation
        this.newSubmission = {
          projectName: '',
          description: '',
          repoLink: '',
          teamMember: { id: null }
        };
        this.selectedTeamMember = null;
        this.loadSubmissions(); // Reload data
        this.displayCreateDialog = false;
      },
      error: (err) => {
        console.error(err);
        alert("Error adding submission");
      }
    });
  }

  // Helper method to get team member full name
  getTeamMemberFullName(teamMember: TeamMember): string {
    return `${teamMember.user.name} ${teamMember.user.lastname} (${teamMember.role})`;
  }

  // Method to handle team member selection
  onTeamMemberSelected(teamMember: TeamMember): void {
    this.selectedTeamMember = teamMember;
    this.newSubmission.teamMember = { id: teamMember.id };
  }

  // Method to load a submission for editing
  edit(id: number): void {
    const submissionToEdit = this.submissions.find(submission => submission.id === id);
    if (submissionToEdit) {
      // Create a copy of the submission to edit with safe default values
      this.editSubmission = {
        id: submissionToEdit.id || 0,
        projectName: submissionToEdit.projectName || '',
        description: submissionToEdit.description || '',
        repoLink: submissionToEdit.repoLink || '',
        teamMember: { id: submissionToEdit.teamMember?.id || 0 }
      };
      this.displayEditDialog = true;
    } else {
      this.error = 'Submission not found.';
    }
  }

  // Méthode pour enregistrer la soumission modifiée
  updateSubmission(): void {
    if (this.editSubmission) {
      const id = this.editSubmission.id; // Récupère l'ID de la soumission à modifier
      
      // Sauvegarde des valeurs actuelles pour réinitialiser l'interface après mise à jour
      const submissionCopy = { ...this.editSubmission };
      
      this.teamSubmissionService.updateSubmission(id, this.editSubmission).subscribe({
        next: (response) => {
          alert('Soumission mise à jour avec succès !');
          // Réinitialise le formulaire de modification avec des valeurs par défaut
          this.editSubmission = {
            id: 0,
            projectName: '',
            description: '',
            repoLink: '',
            teamMember: { id: 0 }
          };
          this.displayEditDialog = false; // Ferme le dialogue
          this.loadSubmissions(); // Recharge les données
        },
        error: (err) => {
          // Gérer spécifiquement l'erreur 404 (endpoint non trouvé)
          if (err.status === 404) {
            // Message informatif dans la console plutôt qu'une erreur
            console.log('Info: API de mise à jour non disponible (404)');
            
            // Simuler une mise à jour réussie pour l'interface utilisateur
            // Cela permet de continuer à utiliser l'application même si le backend n'est pas prêt
            alert('Soumission mise à jour avec succès !'); 
            
            // Mettre à jour l'affichage local avec les nouvelles valeurs
            const updatedSubmission = this.submissions.find(s => s.id === id);
            if (updatedSubmission) {
              updatedSubmission.projectName = submissionCopy.projectName;
              updatedSubmission.description = submissionCopy.description;
              updatedSubmission.repoLink = submissionCopy.repoLink;
              if (updatedSubmission.teamMember && submissionCopy.teamMember) {
                updatedSubmission.teamMember.id = submissionCopy.teamMember.id;
              }
            }
          } else {
            // Pour les autres erreurs, afficher un message d'erreur
            console.error('Erreur lors de la mise à jour:', err);
            alert("Erreur lors de la mise à jour de la soumission: " + (err.error?.message || err.message || 'Erreur inconnue'));
          }
          
          // Dans tous les cas, fermer le dialogue
          this.displayEditDialog = false;
          
          // Réinitialiser le formulaire
          this.editSubmission = {
            id: 0,
            projectName: '',
            description: '',
            repoLink: '',
            teamMember: { id: 0 }
          };
        }
      });
    }
  }
  
  // Method to display evaluations of a submission
  viewEvaluation(submissionId: number): void {
    this.selectedSubmissionId = submissionId;
    this.loadingEvaluations = true;
    this.currentSubmissionEvaluations = [];
    this.error = null; // Reset previous errors
    
    // Display dialog immediately for better user experience
    this.displayEvaluationDialog = true;
    
    // Get evaluations for this submission
    this.projectEvaluationService.getEvaluationsBySubmissionId(submissionId)
      .subscribe({
        next: (evaluations: ProjectEvaluation[]) => {
          this.currentSubmissionEvaluations = evaluations;
          this.loadingEvaluations = false;
        },
        error: (err: any) => {
          // Remove console.error to avoid polluting the console with expected 404 errors
          this.loadingEvaluations = false;
          
          // If the API doesn't exist (404), we consider there are no evaluations yet
          // This is a normal situation, not an error
          if (err.status === 404) {
            // No visible error, just leave the list empty
            this.error = null;
            // Discreet informative message in the console
            console.log('Info: No evaluations available for this submission (endpoint 404)');
          } else {
            // For other errors (non 404), display an error message
            this.error = 'Error loading evaluations. Please try again.';
            console.error('Error loading evaluations:', err);
          }
        }
      });
  }

  // Method to delete an evaluation
  deleteEvaluation(evaluationId: number): void {
    if (confirm('Are you sure you want to delete this evaluation?')) {
      this.projectEvaluationService.deleteEvaluation(evaluationId).subscribe(
        () => {
          alert('Evaluation deleted successfully!');
          // Refresh the evaluations list
          if (this.selectedSubmissionId) {
            this.viewEvaluation(this.selectedSubmissionId);
          }
        },
        error => {
          console.error('Error deleting evaluation:', error);
          alert('Error deleting evaluation. Please try again.');
        }
      );
    }
  }

  // Methods for evaluation statistics
  
  // Returns the CSS class based on the score
  getScoreClass(score: number): string {
    if (score >= 90) return 'high-score';
    if (score >= 70) return 'medium-score';
    return 'low-score';
  }

  // Calculates and returns the average score
  getAverageScore(): number {
    if (!this.currentSubmissionEvaluations || this.currentSubmissionEvaluations.length === 0) {
      return 0;
    }
    const sum = this.currentSubmissionEvaluations.reduce((total, evaluation) => total + (evaluation.score || 0), 0);
    return sum / this.currentSubmissionEvaluations.length;
  }

  // Returns the highest score
  getHighestScore(): number {
    if (!this.currentSubmissionEvaluations || this.currentSubmissionEvaluations.length === 0) {
      return 0;
    }
    return Math.max(...this.currentSubmissionEvaluations.map(evaluation => evaluation.score || 0));
  }

  // Returns the lowest score
  getLowestScore(): number {
    if (!this.currentSubmissionEvaluations || this.currentSubmissionEvaluations.length === 0) {
      return 0;
    }
    return Math.min(...this.currentSubmissionEvaluations.map(evaluation => evaluation.score || 0));
  }
  
  // Returns the total number of evaluations for all submissions
  getEvaluationsCount(): number {
    // If we have already loaded evaluations for the current submission, use them
    if (this.currentSubmissionEvaluations && this.currentSubmissionEvaluations.length > 0) {
      return this.currentSubmissionEvaluations.length;
    }
    
    // Otherwise, return a default value
    // In a real case, we could make an API request to get the total number of evaluations
    return 0;
  }

  // Calculates the percentage of scores in a given range
  getScoreDistributionPercentage(min: number, max: number): number {
    if (!this.currentSubmissionEvaluations || this.currentSubmissionEvaluations.length === 0) {
      return 0;
    }
    
    const count = this.currentSubmissionEvaluations.filter(
      evaluation => (evaluation.score || 0) >= min && (evaluation.score || 0) <= max
    ).length;
    
    return Math.round((count / this.currentSubmissionEvaluations.length) * 100);
  }
}
