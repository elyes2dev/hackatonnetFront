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

  // Mentor data
  mentors: User[] = [];
  topMentors: User[] = [];
  mentorEvaluations: MentorEvaluation[] = [];
  listMentors: ListMentor[] = [];
  
  // Mentor badge distribution
  badgeCounts: { [key: string]: number } = {
    'JUNIOR_COACH': 0,
    'ASSISTANT_COACH': 0,
    'SENIOR_COACH': 0,
    'HEAD_COACH': 0,
    'MASTER_MENTOR': 0
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

  // Add new properties for rating distribution
  ratingDistributionData: any;
  ratingDistributionOptions: any;
  trendOptions: any;

  // Add new interfaces for improved analytics
  mentorMetrics: MentorMetrics[] = [];
  badgeMetrics: { [key: string]: BadgeMetrics } = {};
  ratingDistribution: number[] = Array(5).fill(0);
  mentorTrends: {
    ratings: any;
    participation: any;
    success: any;
  } = {
    ratings: null,
    participation: null,
    success: null
  };

  constructor(
    private hackathonService: HackathonService,
    private userService: UserService,
    private mentorEvaluationService: MentorEvaluationService,
    private listMentorService: ListMentorService
  ) {}

  ngOnInit() {
    console.log('Initializing component...');
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

  formatBadgeKey(key: string): string {
    return key;  // Return the badge as is from database
  }
  
  // Helper method for percentage calculation
  calculatePercentage(value: number): string {
    return this.mentors.length > 0 ? ((value / this.mentors.length) * 100).toFixed(1) : '0';
  }
  
  loadMentors() {
    console.log('Loading mentors...');
    this.userService.getUsers().subscribe((users: User[]) => {
      console.log('All users:', users);
      // Filter users with MENTOR role
      this.mentors = users.filter(user => 
        user.roles && user.roles.some(role => role.name === 'MENTOR')
      );
      console.log('Filtered mentors:', this.mentors);
      
      // Get top mentors by mentor points
      this.topMentors = [...this.mentors]
        .sort((a, b) => (b.mentorPoints || 0) - (a.mentorPoints || 0));
      console.log('Top mentors:', this.topMentors);
      
      // Count mentors by badge and update pie chart
      this.countMentorsByBadge();
      
      // Process mentor data after loading
      this.processMentorEvaluations();
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
      'JUNIOR_COACH': 0,
      'ASSISTANT_COACH': 0,
      'SENIOR_COACH': 0,
      'HEAD_COACH': 0,
      'MASTER_MENTOR': 0
    };
    
    // Count mentors by badge
    this.mentors.forEach(mentor => {
      if (mentor.badge && this.badgeCounts.hasOwnProperty(mentor.badge)) {
        this.badgeCounts[mentor.badge]++;
      } else {
        // If no badge is assigned, count as JUNIOR_COACH
        this.badgeCounts['JUNIOR_COACH']++;
      }
    });

    // Update the pie chart data
    this.updateMentorBadgeChart();
    console.log('Badge counts:', this.badgeCounts);
  }
  
  processMentorEvaluations() {
    // Calculate average rating and distribution for each mentor
    const mentorRatings = new Map<number, { 
      total: number, 
      count: number, 
      distribution: number[], 
      feedbackTexts: string[] 
    }>();
    
    this.mentorEvaluations.forEach(evaluation => {
      const mentorId = evaluation.mentor.id;
      
      if (mentorId !== undefined) {
        if (!mentorRatings.has(mentorId)) {
          mentorRatings.set(mentorId, { 
            total: 0, 
            count: 0, 
            distribution: Array(5).fill(0),
            feedbackTexts: []
          });
        }
        
        const current = mentorRatings.get(mentorId)!;
        current.total += evaluation.rating;
        current.count += 1;
        current.distribution[Math.floor(evaluation.rating) - 1]++;
        current.feedbackTexts.push(evaluation.feedbackText);
      }
    });

    // Process mentor metrics - ensure all mentors are included even without evaluations
    this.mentorMetrics = this.mentors.map(mentor => {
      const ratings = mentorRatings.get(mentor.id!) || { total: 0, count: 0, distribution: Array(5).fill(0) };
      const averageRating = ratings.count > 0 ? ratings.total / ratings.count : 0;
      
      // Count hackathons for this mentor
      const hackathonsCount = this.listMentors.filter(lm => lm.mentor.id === mentor.id).length;
      
      // Calculate success rate
      const successfulTeams = this.mentorEvaluations.filter(
        ev => ev.mentor.id === mentor.id && ev.rating >= 4
      ).length;
      const totalTeams = ratings.count;
      const successRate = totalTeams > 0 ? (successfulTeams / totalTeams) * 100 : 0;

      return {
        id: mentor.id!,
        name: mentor.name,
        lastname: mentor.lastname,
        mentorPoints: mentor.mentorPoints || 0,
        averageRating,
        hackathonsCount,
        successRate,
        badge: mentor.badge || 'JUNIOR_COACH',
        trendIndicator: 'stable' // Default to stable if no historical data
      };
    });

    // Sort mentors by points for display
    this.mentorMetrics.sort((a, b) => b.mentorPoints - a.mentorPoints);

    // Update badge metrics
    this.updateBadgeMetrics();
    
    // Update rating distribution
    this.updateRatingDistribution(mentorRatings);
    
    // Update mentor trends
    this.updateMentorTrends();

    // Update rating distribution chart
    this.updateRatingDistributionChart();

    console.log('Processed mentor metrics:', this.mentorMetrics); // Debug log
  }
  
  private calculateTrendIndicator(mentorId: number): 'up' | 'down' | 'stable' {
    const recentEvaluations = this.mentorEvaluations
      .filter(ev => ev.mentor.id === mentorId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    if (recentEvaluations.length < 2) return 'stable';

    const recentAvg = recentEvaluations.slice(0, 3).reduce((sum, ev) => sum + ev.rating, 0) / 3;
    const previousAvg = recentEvaluations.slice(3, 6).reduce((sum, ev) => sum + ev.rating, 0) / 3;

    if (recentAvg > previousAvg + 0.5) return 'up';
    if (recentAvg < previousAvg - 0.5) return 'down';
    return 'stable';
  }

  private updateBadgeMetrics() {
    const totalMentors = this.mentors.length;
    const badgeRequirements = {
      JUNIOR_COACH: 'New mentors with < 3 hackathons',
      ASSISTANT_COACH: '3+ hackathons, avg rating > 3.5',
      SENIOR_COACH: '5+ hackathons, avg rating > 4.0',
      HEAD_COACH: '10+ hackathons, avg rating > 4.5',
      MASTER_MENTOR: '15+ hackathons, avg rating > 4.8'
    };

    Object.keys(this.badgeCounts).forEach(badge => {
      const count = this.badgeCounts[badge];
      this.badgeMetrics[badge] = {
        count,
        percentage: (count / totalMentors) * 100,
        requirements: badgeRequirements[badge as keyof typeof badgeRequirements],
        trend: this.calculateBadgeTrend(badge)
      };
    });
  }

  private calculateBadgeTrend(badge: string): 'up' | 'down' | 'stable' {
    // This would ideally use historical data to calculate trends
    // For now, return 'stable' as placeholder
    return 'stable';
  }

  private updateRatingDistribution(mentorRatings: Map<number, any>) {
    this.ratingDistribution = Array(5).fill(0);
    
    mentorRatings.forEach(ratings => {
      ratings.distribution.forEach((count: number, index: number) => {
        this.ratingDistribution[index] += count;
      });
    });
  }

  private updateMentorTrends() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const labels = Array.from({length: 6}, (_, i) => {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() - (5 - i));
      return months[d.getMonth()];
    });

    // Calculate monthly averages
    const monthlyData = this.calculateMonthlyMetrics();

    this.mentorTrends = {
      ratings: {
        labels,
        datasets: [{
          label: 'Average Rating',
          data: monthlyData.ratings,
          borderColor: '#4bc0c0',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true
        }]
      },
      participation: {
        labels,
        datasets: [{
          label: 'Active Mentors',
          data: monthlyData.participation,
          borderColor: '#ff9f40',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          fill: true
        }]
      },
      success: {
        labels,
        datasets: [{
          label: 'Success Rate',
          data: monthlyData.success,
          borderColor: '#36a2eb',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true
        }]
      }
    };
  }

  private calculateMonthlyMetrics() {
    const months = Array.from({length: 6}, () => ({
      ratings: [] as number[],
      mentors: new Set<number>(),
      successCount: 0,
      totalCount: 0
    }));

    // Process evaluations for the last 6 months
    this.mentorEvaluations.forEach(evaluation => {
      const date = new Date(evaluation.createdAt!);
      const monthsAgo = Math.floor((new Date().getTime() - date.getTime()) / (30 * 24 * 60 * 60 * 1000));
      
      if (monthsAgo >= 0 && monthsAgo < 6) {
        const monthIndex = 5 - monthsAgo;
        months[monthIndex].ratings.push(evaluation.rating);
        months[monthIndex].mentors.add(evaluation.mentor.id!);
        months[monthIndex].totalCount++;
        if (evaluation.rating >= 4) {
          months[monthIndex].successCount++;
        }
      }
    });

    return {
      ratings: months.map(m => m.ratings.length > 0 ? 
        m.ratings.reduce((sum, r) => sum + r, 0) / m.ratings.length : null),
      participation: months.map(m => m.mentors.size),
      success: months.map(m => m.totalCount > 0 ? 
        (m.successCount / m.totalCount) * 100 : null)
    };
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
      const hackathonDate = new Date(listing.hackathon?.startDate || '');
      
      // Add null check before using mentorId
      if (mentorId !== undefined) {
        if (!mentorActivityCount.has(mentorId)) {
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
      }
    });
    
    // Find top active mentors for each timeframe
    const mentorsWithActivity = this.mentors.filter(mentor => 
      mentor.id !== undefined && mentorActivityCount.has(mentor.id)
    );
    
    this.activeTimeframes.month = [...mentorsWithActivity]
      .sort((a, b) => {
        // Add null checks with defaults for sorting
        const aId = a.id !== undefined ? a.id : 0;
        const bId = b.id !== undefined ? b.id : 0;
        return (mentorActivityCount.get(bId)?.month || 0) - (mentorActivityCount.get(aId)?.month || 0);
      })
      .slice(0, 5);
      
    this.activeTimeframes.halfYear = [...mentorsWithActivity]
      .sort((a, b) => {
        const aId = a.id !== undefined ? a.id : 0;
        const bId = b.id !== undefined ? b.id : 0;
        return (mentorActivityCount.get(bId)?.halfYear || 0) - (mentorActivityCount.get(aId)?.halfYear || 0);
      })
      .slice(0, 5);
      
    this.activeTimeframes.year = [...mentorsWithActivity]
      .sort((a, b) => {
        const aId = a.id !== undefined ? a.id : 0;
        const bId = b.id !== undefined ? b.id : 0;
        return (mentorActivityCount.get(bId)?.year || 0) - (mentorActivityCount.get(aId)?.year || 0);
      })
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
    const badges = Object.keys(this.badgeCounts);
    
    this.mentorPieData = {
      labels: badges,
      datasets: [{
        data: badges.map(badge => this.badgeCounts[badge]),
        backgroundColor: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'],
        hoverBackgroundColor: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c']
      }]
    };

    // Initialize pie chart options if not already done
    if (!this.mentorPieOptions) {
      this.mentorPieOptions = {
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#495057'
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      };
    }

    console.log('Pie chart data:', this.mentorPieData);
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

    // Rating distribution chart options
    this.ratingDistributionOptions = {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.raw;
              const total = this.ratingDistribution.reduce((sum, count) => sum + count, 0);
              const percentage = total > 0 ? (value / total * 100).toFixed(1) : '0';
              return `${value} evaluations (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Rating'
          },
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Number of Evaluations'
          },
          ticks: {
            color: '#495057',
            precision: 0
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

    // Trend chart options
    this.trendOptions = {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            display: false
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          },
          beginAtZero: true
        }
      },
      elements: {
        line: {
          tension: 0.4
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

  // Add calculation methods
  calculateOverallRating(): number {
    const totalRatings = this.mentorEvaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0);
    const totalCount = this.mentorEvaluations.length;
    return totalCount > 0 ? totalRatings / totalCount : 0;
  }

  calculateTotalEvaluations(): number {
    return this.mentorEvaluations.length;
  }

  calculateRatingPercentage(rating: number): number {
    const total = this.ratingDistribution.reduce((sum, count) => sum + count, 0);
    return total > 0 ? (this.ratingDistribution[rating] / total) * 100 : 0;
  }

  // Update the rating distribution data
  private updateRatingDistributionChart() {
    this.ratingDistributionData = {
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      datasets: [{
        data: this.ratingDistribution,
        backgroundColor: '#42A5F5',
        borderColor: '#42A5F5',
        borderWidth: 1
      }]
    };
  }
}

interface MentorMetrics {
  id: number;
  name: string;
  lastname: string;
  mentorPoints: number;
  averageRating: number;
  hackathonsCount: number;
  successRate: number;
  badge: string;
  trendIndicator: 'up' | 'down' | 'stable';
}

interface BadgeMetrics {
  count: number;
  percentage: number;
  requirements: string;
  trend: 'up' | 'down' | 'stable';
}