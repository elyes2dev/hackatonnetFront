import { Component, OnInit } from '@angular/core';
import { HackathonService } from 'src/app/demo/services/hackathon/hackathon.service';
import { UserService } from 'src/app/demo/services/user.service';
import { MentorEvaluationService } from 'src/app/demo/services/mentor-evaluation.service';
import { ListMentorService } from 'src/app/demo/services/list-mentor.service';
import { Hackathon } from 'src/app/demo/models/hackathon';
import { User } from 'src/app/demo/models/user.model';
import { MentorEvaluation } from 'src/app/demo/models/mentor-evaluation.model';
import { ListMentor } from 'src/app/demo/models/list-mentor.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {
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
  onlineCount: number = 0;
  onsiteCount: number = 0;
  
  // Monthly data
  monthlyData: number[] = Array(12).fill(0);
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Time series data for line chart
  timeLabels: string[] = [];
  cumulativeHackathons: number[] = [];

  // Mentor data
  mentors: User[] = [];
  topMentors: User[] = [];
  mentorEvaluations: MentorEvaluation[] = [];
  listMentors: ListMentor[] = [];
  
  // Mentor badge distribution
  badgeCounts: any = {
    JUNIOR_COACH: 0,
    ASSISTANT_COACH: 0,
    SENIOR_COACH: 0,
    HEAD_COACH: 0,
    MASTER_MENTOR: 0
  };
  
  // Mentor data charts
  mentorPieData: any;
  mentorPieOptions: any;
  
  mentorBarData: any;
  mentorBarOptions: any;
  
  mentorRatingData: any;
  mentorRatingOptions: any;
  
  activeTimeframes = {
    month: [] as User[],
    halfYear: [] as User[],
    year: [] as User[]
  };
  
  bestEvaluatedMentors: User[] = [];
  worstEvaluatedMentors: User[] = [];
  
  // Current filter value for evaluations
  evaluationFilter: string = 'best';

  constructor(
    private hackathonService: HackathonService,
    private userService: UserService,
    private mentorEvaluationService: MentorEvaluationService,
    private listMentorService: ListMentorService
  ) {}

  ngOnInit() {
    this.loadHackathons();
    this.loadMentors();
    this.loadMentorEvaluations();
    this.loadListMentors();
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
  
  loadMentors() {
    this.userService.getUsers().subscribe((users: User[]) => {
      // Filter users with MENTOR role
      this.mentors = users.filter(user => 
        user.roles && user.roles.some(role => role.name === 'MENTOR')
      );
      
      // Get top mentors by mentor points
      this.topMentors = [...this.mentors]
        .sort((a, b) => (b.mentorPoints || 0) - (a.mentorPoints || 0))
        .slice(0, 10);
      
      // Count mentors by badge
      this.countMentorsByBadge();
      
      // Update mentor charts
      this.updateMentorBadgeChart();
    });
  }
  
  loadMentorEvaluations() {
    this.mentorEvaluationService.getAllEvaluations().subscribe((evaluations: MentorEvaluation[]) => {
      this.mentorEvaluations = evaluations;
      
      // Process mentor evaluations
      this.processMentorEvaluations();
      
      // Update mentor rating chart
      this.updateMentorRatingChart();
    });
  }
  
  loadListMentors() {
    this.listMentorService.getAllListMentors().subscribe((listMentors: ListMentor[]) => {
      this.listMentors = listMentors;
      
      // Process active mentors by timeframe
      this.processActiveMentorsByTimeframe();
      
      // Update mentor activity chart
      this.updateMentorActivityChart();
    });
  }

  getMentorHackathonsCount(count: number | undefined): string {
    return (count || 0).toString();
  }
  getHackathonCountAsString(count: number | undefined): string {
    return (count || 0).toString();
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
  
  countMentorsByBadge() {
    // Reset badge counts
    this.badgeCounts = {
      JUNIOR_COACH: 0,
      ASSISTANT_COACH: 0,
      SENIOR_COACH: 0,
      HEAD_COACH: 0,
      MASTER_MENTOR: 0
    };
    
    // Count mentors by badge
    this.mentors.forEach(mentor => {
      if (mentor.badge && this.badgeCounts.hasOwnProperty(mentor.badge)) {
        this.badgeCounts[mentor.badge]++;
      }
    });
  }
  
  processMentorEvaluations() {
    // Calculate average rating for each mentor
    const mentorRatings = new Map<number, { total: number, count: number }>();
    
    this.mentorEvaluations.forEach(evaluation => {
      const mentorId = evaluation.mentor.id;
      if (!mentorRatings.has(mentorId)) {
        mentorRatings.set(mentorId, { total: 0, count: 0 });
      }
      const current = mentorRatings.get(mentorId)!;
      current.total += evaluation.rating;
      current.count += 1;
    });
    
    // Create sorted arrays of mentors by average rating
    const mentorsWithRatings = this.mentors.filter(mentor => 
      mentorRatings.has(mentor.id) && mentorRatings.get(mentor.id)!.count > 0
    ).map(mentor => {
      const ratingData = mentorRatings.get(mentor.id)!;
      const averageRating = ratingData.total / ratingData.count;
      return { ...mentor, averageRating };
    });
    
    // Sort mentors by rating
    this.bestEvaluatedMentors = [...mentorsWithRatings]
      .sort((a, b) => (b as any).averageRating - (a as any).averageRating)
      .slice(0, 10);
      
    this.worstEvaluatedMentors = [...mentorsWithRatings]
      .sort((a, b) => (a as any).averageRating - (b as any).averageRating)
      .slice(0, 10);
  }
  
  processActiveMentorsByTimeframe() {
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    // Create a map to count mentor activities
    const mentorActivityCount = new Map<number, { month: number, halfYear: number, year: number }>();
    
    this.listMentors.forEach(listing => {
      const mentorId = listing.mentor.id;
      const hackathonDate = new Date(listing.hackathon?.startDate || '');      if (!mentorActivityCount.has(mentorId)) {
        mentorActivityCount.set(mentorId, { month: 0, halfYear: 0, year: 0 });
      }
      
      const counts = mentorActivityCount.get(mentorId)!;
      
      if (hackathonDate >= oneMonthAgo) {
        counts.month += 1;
      }
      
      if (hackathonDate >= sixMonthsAgo) {
        counts.halfYear += 1;
      }
      
      if (hackathonDate >= oneYearAgo) {
        counts.year += 1;
      }
    });
    
    // Find top active mentors for each timeframe
    const mentorsWithActivity = this.mentors.filter(mentor => mentorActivityCount.has(mentor.id));
    
    this.activeTimeframes.month = [...mentorsWithActivity]
      .sort((a, b) => (mentorActivityCount.get(b.id)?.month || 0) - (mentorActivityCount.get(a.id)?.month || 0))
      .slice(0, 5);
      
    this.activeTimeframes.halfYear = [...mentorsWithActivity]
      .sort((a, b) => (mentorActivityCount.get(b.id)?.halfYear || 0) - (mentorActivityCount.get(a.id)?.halfYear || 0))
      .slice(0, 5);
      
    this.activeTimeframes.year = [...mentorsWithActivity]
      .sort((a, b) => (mentorActivityCount.get(b.id)?.year || 0) - (mentorActivityCount.get(a.id)?.year || 0))
      .slice(0, 5);
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
  
  updateMentorBadgeChart() {
    this.mentorPieData = {
      labels: ['Junior Coach', 'Assistant Coach', 'Senior Coach', 'Head Coach', 'Master Mentor'],
      datasets: [
        {
          data: [
            this.badgeCounts.JUNIOR_COACH,
            this.badgeCounts.ASSISTANT_COACH,
            this.badgeCounts.SENIOR_COACH,
            this.badgeCounts.HEAD_COACH,
            this.badgeCounts.MASTER_MENTOR
          ],
          backgroundColor: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'],
          hoverBackgroundColor: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c']
        }
      ]
    };
  }
  
  updateMentorRatingChart() {
    // Prepare data based on current filter
    const mentors = this.evaluationFilter === 'best' ? this.bestEvaluatedMentors : this.worstEvaluatedMentors;
    
    this.mentorRatingData = {
      labels: mentors.map(m => `${m.name} ${m.lastname}`).slice(0, 7),
      datasets: [
        {
          label: 'Average Rating',
          backgroundColor: this.evaluationFilter === 'best' ? '#4caf50' : '#f44336',
          data: mentors.map(m => (m as any).averageRating.toFixed(1)).slice(0, 7)
        }
      ]
    };
  }
  
  updateMentorActivityChart() {
    // Get the current active mentors timeframe based on the selected option
    const selectedTimeframe = 'month'; // Default to month view
    const mentors = this.activeTimeframes[selectedTimeframe as keyof typeof this.activeTimeframes];
    
    this.mentorBarData = {
      labels: mentors.map(m => `${m.name} ${m.lastname}`),
      datasets: [
        {
          label: 'Hackathons Participated',
          backgroundColor: '#673ab7',
          data: mentors.map(m => {
            const mentorId = m.id;
            const relevantListings = this.listMentors.filter(listing => 
              listing.mentor.id === mentorId
            );
            return relevantListings.length;
          })
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
    
    // Initialize mentor chart options
    this.mentorPieOptions = {
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
    
    this.mentorBarOptions = {
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
    
    this.mentorRatingOptions = {
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
              return `Rating: ${context.raw}`;
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
            suggestedMin: 0,
            suggestedMax: 5
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
  
  // Method to toggle between best and worst evaluated mentors
  toggleEvaluationFilter(filter: string) {
    this.evaluationFilter = filter;
    this.updateMentorRatingChart();
  }
  
  // Method to change the active timeframe
  changeActiveTimeframe(timeframe: string) {
    this.updateMentorActivityChart();
  }
}