import { Component, OnInit } from '@angular/core';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { Hackathon } from 'src/app/demo/models/hackathon';

@Component({
  selector: 'app-hackathon-analytics',
  templateUrl: './hackathon-analytics.component.html',
  styleUrls: ['./hackathon-analytics.component.scss']
})
export class HackathonAnalyticsComponent implements OnInit {
  
  hackathons: Hackathon[] = [];
  
  // Pie chart data and options
  pieData: any;
  pieOptions: any;
  
  // Bar chart data and options
  barData: any;
  barOptions: any;
  
  // Line chart data and options
  lineData: any;
  lineOptions: any;
  
  // Store hackathon counts
  onlineCount = 0;
  onsiteCount = 0;
  
  // Monthly data
  monthlyData: number[] = Array(12).fill(0);
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Time series data for line chart
  timeLabels: string[] = [];
  cumulativeHackathons: number[] = [];

  constructor(private hackathonService: HackathonService) {}

  ngOnInit() {
    this.loadHackathons();
    this.initChartOptions();
  }

  loadHackathons() {
    this.hackathonService.getHackathons().subscribe((hackathons: Hackathon[]) => {
      this.hackathons = hackathons;

      // Count online and onsite hackathons
      this.onlineCount = hackathons.filter(h => h.isOnline).length;
      this.onsiteCount = hackathons.filter(h => !h.isOnline).length;
      
      // Process hackathons by month
      this.processMonthlyData(hackathons);
      
      // Process time series data for line chart
      this.processTimeSeriesData(hackathons);
      
      // Update chart data
      this.updatePieChartData();
      this.updateBarChartData();
      this.updateLineChartData();
    });
  }

  processMonthlyData(hackathons: Hackathon[]) {
    // Reset monthly data
    this.monthlyData = Array(12).fill(0);
    
    // Count hackathons by start month
    hackathons.forEach(hackathon => {
      const startDate = new Date(hackathon.startDate);
      const month = startDate.getMonth(); // 0-11
      this.monthlyData[month]++;
    });
  }
  
  processTimeSeriesData(hackathons: Hackathon[]) {
    // Sort hackathons by creation date
    const sortedHackathons = [...hackathons].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Group by month for time series
    const monthlyGroups = new Map<string, number>();
    
    sortedHackathons.forEach(hackathon => {
      const date = new Date(hackathon.createdAt);
      const monthYear = `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!monthlyGroups.has(monthYear)) {
        monthlyGroups.set(monthYear, 0);
      }
      
      monthlyGroups.set(monthYear, monthlyGroups.get(monthYear)! + 1);
    });
    
    // Create time series data
    this.timeLabels = Array.from(monthlyGroups.keys());
    
    // Calculate cumulative values
    let cumulative = 0;
    this.cumulativeHackathons = [];
    
    Array.from(monthlyGroups.values()).forEach(count => {
      cumulative += count;
      this.cumulativeHackathons.push(cumulative);
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

  updateBarChartData() {
    this.barData = {
      labels: this.monthNames,
      datasets: [
        {
          label: 'Number of Hackathons',
          backgroundColor: '#42A5F5',
          data: this.monthlyData
        }
      ]
    };
  }
  
  updateLineChartData() {
    this.lineData = {
      labels: this.timeLabels,
      datasets: [
        {
          label: 'Total Hackathons',
          data: this.cumulativeHackathons,
          fill: false,
          borderColor: '#4bc0c0',
          tension: 0.4,
          pointBackgroundColor: '#4bc0c0'
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
    
    this.barOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        },
        tooltip: {
          callbacks: {
            title: (context: any) => {
              return context[0].label;
            },
            label: (context: any) => {
              return `Hackathons: ${context.raw}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057',
            precision: 0 // Only show whole numbers
          },
          grid: {
            color: '#ebedef'
          },
          beginAtZero: true
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
    
    this.lineOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057',
            precision: 0 // Only show whole numbers
          },
          grid: {
            color: '#ebedef'
          },
          beginAtZero: true
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }
}