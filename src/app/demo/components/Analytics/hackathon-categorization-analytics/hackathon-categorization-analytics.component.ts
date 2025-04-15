import { Component, OnInit } from '@angular/core';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { CategorizationService } from 'src/app/demo/services/categorization/categorization.service';
import { Hackathon } from 'src/app/demo/models/hackathon';

@Component({
  selector: 'app-hackathon-categorization-analytics',
  templateUrl: './hackathon-categorization-analytics.component.html',
  styleUrls: ['./hackathon-categorization-analytics.component.scss']
})
export class HackathonCategorizationAnalyticsComponent {
  hackathons: Hackathon[] = [];
  
  // Chart data
  themeChartData: any;
  audienceChartData: any;
  techChartData: any;
  eventTypeChartData: any;
  
  // Chart options - consistent styling
  chartOptions: any = {
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  constructor(
    private hackathonService: HackathonService,
    private categorizationService: CategorizationService
  ) {}

  ngOnInit() {
    this.loadHackathons();
  }

  loadHackathons() {
    this.hackathonService.getHackathons().subscribe((data: Hackathon[]) => {
      this.hackathons = data;
      this.generateChartData();
    });
  }

  generateChartData() {
    // Create event type chart data
    this.eventTypeChartData = {
      labels: ['Online', 'Onsite'],
      datasets: [{
        data: [
          this.hackathons.filter(h => h.isOnline).length,
          this.hackathons.filter(h => !h.isOnline).length
        ],
        backgroundColor: ['#36A2EB', '#FF6384']
      }]
    };
    
    // Get category distribution data
    const categoryDistribution = this.categorizationService.getCategoryDistribution(this.hackathons);
    
    // Create pie chart data for themes
    this.themeChartData = {
      labels: Object.keys(categoryDistribution['theme']).map(theme => this.capitalizeFirstLetter(theme)),
      datasets: [
        {
          data: Object.values(categoryDistribution['theme']),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ]
        }
      ]
    };
    
    // Create pie chart data for audience
    this.audienceChartData = {
      labels: Object.keys(categoryDistribution['audience']).map(audience => this.capitalizeFirstLetter(audience)),
      datasets: [
        {
          data: Object.values(categoryDistribution['audience']),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
          ]
        }
      ]
    };
    
    // Create pie chart data for tech
    this.techChartData = {
      labels: Object.keys(categoryDistribution['tech']).map(tech => this.capitalizeFirstLetter(tech)),
      datasets: [
        {
          data: Object.values(categoryDistribution['tech']),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ]
        }
      ]
    };
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
