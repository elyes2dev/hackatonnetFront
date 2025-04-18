import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Hackathon } from 'src/app/demo/models/hackathon';

@Component({
  selector: 'app-hackathon-insights',
  templateUrl: './hackathon-insights.component.html',
  styleUrls: ['./hackathon-insights.component.scss']
})
export class HackathonInsightsComponent implements OnChanges {
  @Input() hackathons: Hackathon[] = [];
  @Input() onlineCount: number = 0;
  @Input() onsiteCount: number = 0;
  @Input() monthlyData: number[] = [];
  @Input() monthNames: string[] = [];
  @Input() timeLabels: string[] = [];
  @Input() cumulativeHackathons: number[] = [];

  insights: string[] = [];
  topInsight: string = '';
  loading: boolean = true;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    // Only generate insights when we have data
    if ((changes['hackathons'] && this.hackathons.length > 0) || 
        (changes['monthlyData'] && this.monthlyData.length > 0) ||
        (changes['cumulativeHackathons'] && this.cumulativeHackathons.length > 0)) {
      this.generateInsights();
    }
  }

  private generateInsights(): void {
    this.loading = true;
    this.insights = [];

    // Generate distribution insights
    this.addDistributionInsights();
    
    // Generate monthly trends insights
    this.addMonthlyTrendsInsights();
    
    // Generate growth insights
    this.addGrowthInsights();
    
    // Add seasonal patterns
    this.addSeasonalPatternInsights();
    
    // Additional context-specific insights
    this.addContextualInsights();
    
    // Set the top insight (most significant finding)
    this.setTopInsight();
    
    this.loading = false;
  }

  private addDistributionInsights(): void {
    const total = this.onlineCount + this.onsiteCount;
    if (total === 0) return;
    
    const onlinePercentage = Math.round((this.onlineCount / total) * 100);
    const onsitePercentage = 100 - onlinePercentage;
    
    if (this.onlineCount > this.onsiteCount) {
      this.insights.push(`Online hackathons represent ${onlinePercentage}% of all events, showing a clear preference for virtual formats.`);
    } else if (this.onsiteCount > this.onlineCount) {
      this.insights.push(`In-person hackathons account for ${onsitePercentage}% of all events, indicating a preference for physical collaboration.`);
    } else {
      this.insights.push(`There's an even 50/50 split between online and onsite hackathons, showing balanced format adoption.`);
    }
  }

  private addMonthlyTrendsInsights(): void {
    if (this.monthlyData.length === 0) return;
    
    // Find the most popular month
    let maxValue = Math.max(...this.monthlyData);
    let maxIndex = this.monthlyData.indexOf(maxValue);
    let maxMonth = this.monthNames[maxIndex];
    
    this.insights.push(`${maxMonth} is the most popular month for hackathons with ${maxValue} events.`);
    
    // Find the least popular month that has events
    const nonZeroMonths = this.monthlyData.filter(count => count > 0);
    if (nonZeroMonths.length < this.monthlyData.length) {
      let minValue = Math.min(...nonZeroMonths);
      let minIndices = this.monthlyData.map((value, index) => value === minValue ? index : -1).filter(index => index !== -1);
      let minMonth = this.monthNames[minIndices[0]];
      
      if (minValue < maxValue) {
        this.insights.push(`${minMonth} has the fewest hackathons with only ${minValue} events.`);
      }
    }
    
    // Identify seasonal patterns
    const q1Sum = this.monthlyData.slice(0, 3).reduce((sum, curr) => sum + curr, 0);
    const q2Sum = this.monthlyData.slice(3, 6).reduce((sum, curr) => sum + curr, 0);
    const q3Sum = this.monthlyData.slice(6, 9).reduce((sum, curr) => sum + curr, 0);
    const q4Sum = this.monthlyData.slice(9, 12).reduce((sum, curr) => sum + curr, 0);
    
    const quarters = [
      { name: "Q1 (Jan-Mar)", value: q1Sum },
      { name: "Q2 (Apr-Jun)", value: q2Sum },
      { name: "Q3 (Jul-Sep)", value: q3Sum },
      { name: "Q4 (Oct-Dec)", value: q4Sum }
    ];
    
    quarters.sort((a, b) => b.value - a.value);
    
    if (quarters[0].value > quarters[3].value * 1.5) {
      this.insights.push(`${quarters[0].name} is significantly more active with ${quarters[0].value} hackathons, ${Math.round((quarters[0].value/quarters[3].value - 1) * 100)}% more than ${quarters[3].name}.`);
    }
  }

  private addGrowthInsights(): void {
    if (this.cumulativeHackathons.length < 2 || this.timeLabels.length < 2) return;
    
    // Calculate growth rate
    const latestTotal = this.cumulativeHackathons[this.cumulativeHackathons.length - 1];
    const previousTotal = this.cumulativeHackathons[this.cumulativeHackathons.length - 2];
    
    if (previousTotal > 0) {
      const growthRate = ((latestTotal - previousTotal) / previousTotal) * 100;
      
      if (growthRate > 0) {
        this.insights.push(`Hackathon growth rate is ${growthRate.toFixed(1)}% month-over-month based on the most recent data.`);
      } else if (growthRate < 0) {
        this.insights.push(`Hackathon activity decreased by ${Math.abs(growthRate).toFixed(1)}% compared to the previous month.`);
      } else {
        this.insights.push(`Hackathon activity has remained stable with no growth in the most recent month.`);
      }
    }
    
    // Check for acceleration or deceleration in growth
    if (this.cumulativeHackathons.length > 3) {
      const current = this.cumulativeHackathons[this.cumulativeHackathons.length - 1] - this.cumulativeHackathons[this.cumulativeHackathons.length - 2];
      const previous = this.cumulativeHackathons[this.cumulativeHackathons.length - 2] - this.cumulativeHackathons[this.cumulativeHackathons.length - 3];
      
      if (current > previous * 1.25) {
        this.insights.push(`Hackathon creation is accelerating with a ${((current/previous - 1) * 100).toFixed(0)}% increase in new events compared to the previous period.`);
      } else if (current < previous * 0.75) {
        this.insights.push(`Hackathon creation is slowing down with a ${((1 - current/previous) * 100).toFixed(0)}% decrease in new events compared to the previous period.`);
      }
    }
  }

  private addSeasonalPatternInsights(): void {
    if (this.monthlyData.length !== 12) return;
    
    // Check for academic patterns (higher in summer and winter breaks)
    const summerMonths = [5, 6, 7]; // June, July, August
    const winterMonths = [11, 0, 1]; // December, January, February
    
    const summerSum = summerMonths.reduce((sum, month) => sum + this.monthlyData[month], 0);
    const winterSum = winterMonths.reduce((sum, month) => sum + this.monthlyData[month], 0);
    const otherMonthsSum = this.monthlyData.reduce((sum, val, idx) => 
      !summerMonths.includes(idx) && !winterMonths.includes(idx) ? sum + val : sum, 0);
    
    const summerAvg = summerSum / summerMonths.length;
    const winterAvg = winterSum / winterMonths.length;
    const otherAvg = otherMonthsSum / (12 - summerMonths.length - winterMonths.length);
    
    if (summerAvg > otherAvg * 1.3 && winterAvg > otherAvg * 1.3) {
      this.insights.push(`Hackathons show a strong academic calendar pattern with peaks during summer and winter breaks.`);
    } else if (summerAvg > otherAvg * 1.3) {
      this.insights.push(`Summer months (Jun-Aug) show ${Math.round((summerAvg/otherAvg - 1) * 100)}% higher hackathon activity than other seasons.`);
    } else if (winterAvg > otherAvg * 1.3) {
      this.insights.push(`Winter months (Dec-Feb) show ${Math.round((winterAvg/otherAvg - 1) * 100)}% higher hackathon activity than other seasons.`);
    }
  }

  private addContextualInsights(): void {
    if (this.hackathons.length === 0) return;
    
    // Check for online vs onsite growth trends
    if (this.hackathons.length >= 10) {
      const oldestHalf = this.hackathons.slice(0, Math.floor(this.hackathons.length / 2));
      const newestHalf = this.hackathons.slice(Math.floor(this.hackathons.length / 2));
      
      const oldOnlineCount = oldestHalf.filter(h => h.isOnline).length;
      const oldOnsiteCount = oldestHalf.filter(h => !h.isOnline).length;
      const newOnlineCount = newestHalf.filter(h => h.isOnline).length;
      const newOnsiteCount = newestHalf.filter(h => !h.isOnline).length;
      
      const oldOnlinePercent = oldOnlineCount / oldestHalf.length * 100;
      const newOnlinePercent = newOnlineCount / newestHalf.length * 100;
      
      if (newOnlinePercent > oldOnlinePercent * 1.25) {
        this.insights.push(`Online hackathons have grown from ${oldOnlinePercent.toFixed(0)}% to ${newOnlinePercent.toFixed(0)}% of total events, showing a shift toward virtual formats.`);
      } else if (newOnlinePercent < oldOnlinePercent * 0.75) {
        this.insights.push(`In-person hackathons are making a comeback, growing from ${(100-oldOnlinePercent).toFixed(0)}% to ${(100-newOnlinePercent).toFixed(0)}% of total events.`);
      }
    }
    
    // Get latest month with data
    if (this.monthlyData.length === 12) {
      const currentMonth = new Date().getMonth();
      const previousMonth = (currentMonth - 1 + 12) % 12;
      
      if (this.monthlyData[currentMonth] > 0 && this.monthlyData[previousMonth] > 0) {
        const monthOverMonthChange = ((this.monthlyData[currentMonth] / this.monthlyData[previousMonth]) - 1) * 100;
        
        if (Math.abs(monthOverMonthChange) >= 20) {
          const direction = monthOverMonthChange > 0 ? 'increased' : 'decreased';
          this.insights.push(`${this.monthNames[currentMonth]} hackathon activity has ${direction} by ${Math.abs(monthOverMonthChange).toFixed(0)}% compared to ${this.monthNames[previousMonth]}.`);
        }
      }
    }
  }

  private setTopInsight(): void {
    if (this.insights.length === 0) {
      this.topInsight = 'Insufficient data to generate insights. Add more hackathon data to see trends and patterns.';
      return;
    }
    
    // For now, just use the first insight as the top one
    // In a more sophisticated implementation, you could score insights based on significance
    this.topInsight = this.insights[0];
  }
}