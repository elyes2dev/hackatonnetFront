import { Component, OnInit, OnDestroy } from '@angular/core';
import { FacialAnalysisService, FacialMetrics } from 'src/app/demo/services/live-stream/facial-analysis/facial-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-facial-metrics',
  template: `
    <div class="metrics-container" *ngIf="enabled">
      <div class="metrics-header">
        <h3>Engagement Metrics</h3>
        <span class="status" [ngClass]="metrics.isAttentive ? 'attentive' : 'inattentive'">
          {{ metrics.isAttentive ? 'Attentive' : 'Inattentive' }}
        </span>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">Attention Time</div>
          <div class="metric-value">{{ formattedMetrics.attentionTimeOn }}</div>
        </div>
        
        <div class="metric-item">
          <div class="metric-label">Inattention Time</div>
          <div class="metric-value">{{ formattedMetrics.attentionTimeOff }}</div>
        </div>
        
        <div class="metric-item">
          <div class="metric-label">Attention Rate</div>
          <div class="metric-value">{{ formattedMetrics.attentionPercent }}</div>
        </div>
        
        <div class="metric-item">
          <div class="metric-label">Smile Count</div>
          <div class="metric-value">{{ metrics.smileCount }}</div>
        </div>
        
        <div class="metric-item">
          <div class="metric-label">Smile Duration</div>
          <div class="metric-value">{{ formattedMetrics.smileDuration }}</div>
        </div>
        
        <div class="metric-item">
          <div class="metric-label">Current Emotion</div>
          <div class="metric-value emotion">
            {{ metrics.currentEmotion | titlecase }}
            <span class="emotion-icon" *ngIf="metrics.isSmiling">😊</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metrics-container {
      background-color: rgba(0, 0, 0, 0.8);
      border-radius: 8px;
      color: white;
      padding: 12px;
      margin-top: 12px;
    }
    
    .metrics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .metrics-header h3 {
      margin: 0;
      font-size: 16px;
    }
    
    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .attentive {
      background-color: #4caf50;
    }
    
    .inattentive {
      background-color: #f44336;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    
    .metric-item {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      padding: 8px;
    }
    
    .metric-label {
      font-size: 12px;
      color: #c5c5c5;
      margin-bottom: 4px;
    }
    
    .metric-value {
      font-size: 16px;
      font-weight: bold;
    }
    
    .emotion {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .emotion-icon {
      font-size: 18px;
    }
  `]
})
export class FacialMetricsComponent implements OnInit, OnDestroy {
  metrics: FacialMetrics = {
    attentionTimeOn: 0,
    attentionTimeOff: 0,
    smileCount: 0,
    smileDuration: 0,
    currentEmotion: 'neutral',
    emotionConfidence: 0,
    isAttentive: false,
    isSmiling: false
  };
  
  formattedMetrics: any = {
    attentionTimeOn: '0:00',
    attentionTimeOff: '0:00',
    attentionPercent: '0%',
    smileDuration: '0:00'
  };
  
  enabled = true;
  private subscription: Subscription | null = null;
  
  constructor(private facialAnalysisService: FacialAnalysisService) {}
  
  ngOnInit(): void {
    this.subscription = this.facialAnalysisService.metrics$.subscribe(metrics => {
      this.metrics = metrics;
      this.formattedMetrics = this.facialAnalysisService.getFormattedMetrics();
    });
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  toggleVisibility(): void {
    this.enabled = !this.enabled;
  }
}