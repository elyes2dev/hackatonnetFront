import { Component, Input, OnInit } from '@angular/core';
import { Resources } from '../../models/resources.model';
import { Workshop } from '../../models/workshop.model';
import { Quiz } from '../../models/quiz.model';
import { ResourceService } from '../../services/resources.service';
import { WorkshopService } from '../../services/workshop.service';
import { QuizService } from '../../services/quiz.service';
import { ChartData } from 'chart.js/auto';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {
  @Input() visible = false; // This will control visibility of the component
  resources: Resources[] = [];
  workshops: Workshop[] = [];
  quizzes: Quiz[] = [];

  workshopThemes: Record<string, number> = {};
  resourcesByNiveau: Record<string, number> = {};
  quizzesByStatus: Record<string, number> = {}; // New object to group quizzes by 'published' or 'unpublished'
  totalQuizzes = 0; // Add a property for the total number of quizzes

  workshopThemeChartData!: ChartData<'pie'>;
  resourcesNiveauChartData!: ChartData<'bar'>;
  quizzesChartData!: ChartData<'doughnut'>;

  constructor(
    private resourceService: ResourceService,
    private workshopService: WorkshopService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.resourceService.getAll().subscribe((resources) => {
      this.resources = resources;
      this.processResources();
    });

    this.workshopService.getAllWorkshops().subscribe((workshops) => {
      this.workshops = workshops;
      this.processWorkshops();
    });

    this.quizService.getAllQuizzes().subscribe((quizzes) => {
      this.quizzes = quizzes;
      this.processQuizzes(); // Update quizzes based on their publish status
    });
  }

  processResources() {
    this.resourcesByNiveau = {};
    this.resources.forEach((res) => {
      const niveau = res.niveau;
      this.resourcesByNiveau[niveau] = (this.resourcesByNiveau[niveau] || 0) + 1;
    });

    this.resourcesNiveauChartData = {
      labels: Object.keys(this.resourcesByNiveau),
      datasets: [
        {
          label: 'Resources by Niveau',
          data: Object.values(this.resourcesByNiveau),
          backgroundColor: ['#3f51b5', '#ff9800', '#e91e63', '#4caf50'],
        },
      ],
    };
  }

  processWorkshops() {
    this.workshopThemes = {};
    this.workshops.forEach((w) => {
      const theme = w.theme;
      this.workshopThemes[theme] = (this.workshopThemes[theme] || 0) + 1;
    });

    this.workshopThemeChartData = {
      labels: Object.keys(this.workshopThemes),
      datasets: [
        {
          label: 'Workshops by Theme',
          data: Object.values(this.workshopThemes),
          backgroundColor: ['#ff5722', '#00bcd4', '#8bc34a', '#ffc107'],
        },
      ],
    };
  }

  processQuizzes() {
    // Reset the quizzes by status
    this.quizzesByStatus = {
      Published: 0,
      Unpublished: 0,
    };

    // Iterate through quizzes and classify them by published status
    this.quizzes.forEach((quiz) => {
      const status = quiz.isPublished ? 'Published' : 'Unpublished';
      this.quizzesByStatus[status] = (this.quizzesByStatus[status] || 0) + 1;
    });

    // Calculate the total number of quizzes
    this.totalQuizzes = this.quizzes.length;

    // Now creating the chart data for quizzes (for other views)
    this.quizzesChartData = {
      labels: Object.keys(this.quizzesByStatus),
      datasets: [
        {
          label: 'Quizzes by Status',
          data: Object.values(this.quizzesByStatus),
          backgroundColor: ['#4caf50', '#ff5722'], // Green for Published, Red for Unpublished
        },
      ],
    };
  }
}
