import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/demo/models/user.model';
import { AuthService } from 'src/app/demo/services/auth.service';
import { UserService } from 'src/app/demo/services/user.service';
import { WorkshopService } from 'src/app/demo/services/workshop.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { SelectItem } from 'primeng/api';

interface FeedbackResult {
  workshopId: string;
  sentiment: string;
  rating: number;
  confidence: number;
  key_points: string[];
  feedbackText: string;
  timestamp: number;
}

@Component({
  selector: 'app-workshoplistf',
  templateUrl: './workshoplistf.component.html',
  styleUrls: ['./workshoplistf.component.scss']
})
export class WorkshoplistfComponent implements OnInit {
  workshops: any[] = [];
  isLoading = true;
  isAdmin: boolean = false;
  isStudent: boolean = false;
  searchName: string = '';
  selectedTheme: string = '';
  uniqueThemes: string[] = [];
  favorites: string[] = [];
  recentlyViewed: string[] = [];
  feedbackDialogVisible: boolean = false;
  allFeedbacksDialogVisible: boolean = false;
  feedbackText: string = '';
  analysisResult: any = null;
  currentWorkshopId: string | null = null;
  dialogMode: 'submit' | 'view' = 'submit';

  // Feedback filtering
  feedbackSearchQuery: string = '';
  selectedSentimentFilter: string = '';
  selectedRatingFilter: number | null = null;
  filteredFeedbacks: FeedbackResult[] = [];

  sentimentFilters: SelectItem[] = [
    { label: 'All Sentiments', value: '' },
    { label: 'Very Positive', value: 'very positive' },
    { label: 'Positive', value: 'positive' },
    { label: 'Neutral', value: 'neutral' },
    { label: 'Negative', value: 'negative' },
    { label: 'Very Negative', value: 'very negative' }
  ];

  ratingFilters: SelectItem[] = [
    { label: 'All Ratings', value: null },
    { label: '5 Stars', value: 5 },
    { label: '4 Stars', value: 4 },
    { label: '3 Stars', value: 3 },
    { label: '2 Stars', value: 2 },
    { label: '1 Star', value: 1 }
  ];

  constructor(
    private workshopService: WorkshopService,
    private userService: UserService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.getAllWorkshops();
    this.getUserRole();
    this.loadFavorites();
    this.loadRecentlyViewed();
  }

  getAllWorkshops() {
    this.workshopService.getAllWorkshops().subscribe({
      next: (data: any[]) => {
        this.workshops = data;
        this.uniqueThemes = Array.from(
          new Set(data.map((w) => w.theme).filter((t) => !!t))
        );
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to fetch workshops:', err);
        this.isLoading = false;
      }
    });
  }

  getUserRole() {
    const userRole = this.authService.getUserRole(); 
    if (userRole === 'admin') {
      this.isAdmin = true;
    } else if (userRole === 'student') {
      this.isStudent = true;
    }
    const userId = localStorage.getItem('loggedid'); // Assuming user ID is stored in localStorage
    console.log('UserID from localStorage:', userId);
  }

  // Mark workshop as favorite/unfavorite
  toggleFavorite(workshopId: string) {
    const index = this.favorites.indexOf(workshopId);
    if (index === -1) {
      this.favorites.push(workshopId);
    } else {
      this.favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  // Mark a workshop as recently viewed
  viewWorkshop(workshopId: string) {
    if (!this.recentlyViewed.includes(workshopId)) {
      this.recentlyViewed.push(workshopId);
      localStorage.setItem('recentlyViewed', JSON.stringify(this.recentlyViewed));
    }
  }

  // Load favorites from localStorage
  loadFavorites() {
    const favorites = localStorage.getItem('favorites');
    this.favorites = favorites ? JSON.parse(favorites) : [];
  }

  // Load recently viewed workshops from localStorage
  loadRecentlyViewed() {
    const recentlyViewed = localStorage.getItem('recentlyViewed');
    this.recentlyViewed = recentlyViewed ? JSON.parse(recentlyViewed) : [];
  }

  // Delete workshop
  deleteWorkshop(id: number): void {
    if (confirm('Are you sure you want to delete this workshop?')) {
      this.workshopService.deleteWorkshop(id).subscribe({
        next: () => {
          this.workshops = this.workshops.filter(w => w.id !== id);
          alert('Workshop deleted successfully');
        },
        error: (err) => console.error('Deletion failed:', err)
      });
    }
  }

  // Check if the logged-in user is the owner of the workshop
  isOwner(workshopOwnerId: number): boolean {
    const userId = localStorage.getItem('loggedid');
    return userId ? parseInt(userId) === workshopOwnerId : false;
  }

  showFeedbackDialog(workshopId: string) {
    this.currentWorkshopId = workshopId;
    this.dialogMode = 'submit';
    this.feedbackDialogVisible = true;
    this.feedbackText = '';
    this.analysisResult = null;
  }

  viewFeedback(workshopId: string) {
    this.currentWorkshopId = workshopId;
    this.dialogMode = 'view';
    this.feedbackDialogVisible = true;
    this.analysisResult = this.getFeedbackFromStorage(workshopId);
    this.feedbackText = this.analysisResult.feedbackText;
  }

  async analyzeFeedback() {
    if (!this.feedbackText?.trim() || !this.currentWorkshopId) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5050/analyze-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: this.feedbackText
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze feedback');
      }

      const result = await response.json();
      
      // Add the feedback text and timestamp to the result
      this.analysisResult = {
        ...result,
        workshopId: this.currentWorkshopId,
        feedbackText: this.feedbackText,
        timestamp: Date.now()
      };

      // Save to localStorage
      this.saveFeedbackToStorage(this.currentWorkshopId, this.analysisResult);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Feedback submitted successfully!'
      });
      
    } catch (error) {
      console.error('Error analyzing feedback:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to analyze feedback. Please try again.'
      });
    }
  }

  closeDialog() {
    this.feedbackDialogVisible = false;
    this.feedbackText = '';
    this.analysisResult = null;
    this.currentWorkshopId = null;
  }

  showAllFeedbacks() {
    this.allFeedbacksDialogVisible = true;
    this.filterFeedbacks();
  }

  filterFeedbacks() {
    // Get all feedbacks from localStorage
    const allFeedbacks = this.getAllFeedbacks();
    
    this.filteredFeedbacks = allFeedbacks.filter(feedback => {
      const matchesSearch = !this.feedbackSearchQuery || 
        feedback.feedbackText.toLowerCase().includes(this.feedbackSearchQuery.toLowerCase()) ||
        this.getWorkshopName(feedback.workshopId).toLowerCase().includes(this.feedbackSearchQuery.toLowerCase());
      
      const matchesSentiment = !this.selectedSentimentFilter || 
        feedback.sentiment.toLowerCase() === this.selectedSentimentFilter.toLowerCase();
      
      const matchesRating = !this.selectedRatingFilter || 
        feedback.rating === this.selectedRatingFilter;

      return matchesSearch && matchesSentiment && matchesRating;
    });
  }

  getWorkshopName(workshopId: string): string {
    const workshop = this.workshops.find(w => w.id.toString() === workshopId);
    return workshop ? workshop.name : 'Unknown Workshop';
  }

  getSentimentClass(sentiment: string): string {
    const normalizedSentiment = sentiment.toLowerCase();
    if (normalizedSentiment.includes('very positive') || normalizedSentiment.includes('very happy')) {
      return 'very-positive';
    } else if (normalizedSentiment.includes('positive') || normalizedSentiment.includes('satisfied')) {
      return 'positive';
    } else if (normalizedSentiment.includes('neutral') || normalizedSentiment.includes('content')) {
      return 'neutral';
    } else if (normalizedSentiment.includes('very negative') || normalizedSentiment.includes('very frustrated')) {
      return 'very-negative';
    } else {
      return 'negative';
    }
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'info';
    if (confidence >= 40) return 'warning';
    return 'danger';
  }

  getTotalFeedbackCount(): number {
    return this.getAllFeedbacks().length;
  }

  hasFeedback(workshopId: string): boolean {
    const feedback = this.getFeedbackFromStorage(workshopId);
    return feedback !== null;
  }

  private getFeedbackFromStorage(workshopId: string): FeedbackResult | null {
    const key = `workshop_feedback_${workshopId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  private saveFeedbackToStorage(workshopId: string, feedback: FeedbackResult) {
    const key = `workshop_feedback_${workshopId}`;
    localStorage.setItem(key, JSON.stringify(feedback));
  }

  private getAllFeedbacks(): FeedbackResult[] {
    const feedbacks: FeedbackResult[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('workshop_feedback_')) {
        const feedback = JSON.parse(localStorage.getItem(key) || '');
        feedbacks.push(feedback);
      }
    }
    return feedbacks.sort((a, b) => b.timestamp - a.timestamp);
  }
}
