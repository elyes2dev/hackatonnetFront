import { Component, OnInit } from '@angular/core';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Hackathon } from 'src/app/demo/models/hackathon';

@Component({
  selector: 'app-hackathon-analytics',
  templateUrl: './hackathon-analytics.component.html',
  styleUrls: ['./hackathon-analytics.component.scss']
})
export class HackathonAnalyticsComponent implements OnInit {
  // Pie chart data and options
  pieData: any;
  pieOptions: any;
  
  // Store hackathon counts
  onlineCount: number = 0;
  onsiteCount: number = 0;

  constructor(private hackathonService: HackathonService) {}

  ngOnInit() {
    this.loadHackathons();
    this.initChartOptions();
  }

  loadHackathons() {
    this.hackathonService.getHackathons().subscribe((hackathons: Hackathon[]) => {
      // Count online and onsite hackathons
      this.onlineCount = hackathons.filter(h => h.isOnline).length;
      this.onsiteCount = hackathons.filter(h => !h.isOnline).length;
      
      // Update pie chart data
      this.updatePieChartData();
    });
  }

  updatePieChartData() {
    this.pieData = {
      labels: ['Online', 'Onsite'],
      datasets: [
        {
          data: [this.onlineCount, this.onsiteCount],
          backgroundColor: ['#FF6384', '#36A2EB'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB']
        }
      ]
    };
  }

  initChartOptions() {
    this.pieOptions = {
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => {
              const dataset = tooltipItem.dataset;
              const total = dataset.data.reduce((previousValue: number, currentValue: number) => previousValue + currentValue);
              const currentValue = dataset.data[tooltipItem.dataIndex];
              const percentage = Math.floor(((currentValue / total) * 100) + 0.5);
              return `${tooltipItem.label}: ${currentValue} (${percentage}%)`;
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }
}