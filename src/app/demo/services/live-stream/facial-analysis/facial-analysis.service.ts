import { Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';
import { BehaviorSubject } from 'rxjs';

export interface FacialMetrics {
  attentionTimeOn: number;
  attentionTimeOff: number;
  smileCount: number;
  smileDuration: number;
  currentEmotion: string;
  emotionConfidence: number;
  isAttentive: boolean;
  isSmiling: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FacialAnalysisService {
  private modelsLoaded = false;
  private analysisInterval: any;
  private lastAnalysisTime = 0;
  private analysisPeriod = 500; // Analysis every 500ms
  
  // Metrics tracking
  private attentionStartTime = 0;
  private smileStartTime = 0;
  private wasAttentive = false;
  private wasSmiling = false;
  
  // Metrics to share with components
  private metricsSubject = new BehaviorSubject<FacialMetrics>({
    attentionTimeOn: 0,
    attentionTimeOff: 0,
    smileCount: 0,
    smileDuration: 0,
    currentEmotion: 'neutral',
    emotionConfidence: 0,
    isAttentive: false,
    isSmiling: false
  });

  public metrics$ = this.metricsSubject.asObservable();
  
  constructor() {}

  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;
    
    try {
      // Set model path to your assets folder
      const modelPath = '/assets/models';
      
      // Load all required models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
      ]);
      
      this.modelsLoaded = true;
      console.log('Facial analysis models loaded');
    } catch (error) {
      console.error('Error loading facial analysis models:', error);
      throw error;
    }
  }

  startAnalysis(videoElement: HTMLVideoElement): void {
    if (!this.modelsLoaded) {
      console.error('Models not loaded. Call loadModels() first.');
      return;
    }
    
    // Initialize timing metrics
    this.attentionStartTime = Date.now();
    this.lastAnalysisTime = Date.now();
    
    // Reset metrics
    this.resetMetrics();
    
    this.analysisInterval = setInterval(() => {
      this.analyzeFrame(videoElement);
    }, this.analysisPeriod);
  }

  private resetMetrics(): void {
    this.metricsSubject.next({
      attentionTimeOn: 0,
      attentionTimeOff: 0,
      smileCount: 0,
      smileDuration: 0,
      currentEmotion: 'neutral',
      emotionConfidence: 0,
      isAttentive: false,
      isSmiling: false
    });
    
    this.wasAttentive = false;
    this.wasSmiling = false;
  }

  private async analyzeFrame(videoElement: HTMLVideoElement): Promise<void> {
    if (!videoElement || videoElement.paused || videoElement.ended) return;
    
    const now = Date.now();
    const timeDelta = now - this.lastAnalysisTime;
    this.lastAnalysisTime = now;
    
    try {
      // Detect faces with expressions and landmarks
      const detections = await faceapi.detectAllFaces(
        videoElement, 
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceExpressions();
      
      if (detections.length === 0) {
        this.handleNoFaceDetected(timeDelta);
        return;
      }
      
      // Use the most prominent face (typically the largest)
      const detection = detections[0];
      
      // Process the detection results
      this.processDetection(detection, timeDelta);
      
    } catch (error) {
      console.error('Error during facial analysis:', error);
    }
  }

  private handleNoFaceDetected(timeDelta: number): void {
    // Update attention metrics - no face means not attentive
    const currentMetrics = this.metricsSubject.value;
    
    // If previously attentive, update the transition
    if (this.wasAttentive) {
      this.wasAttentive = false;
    }
    
    // Always count as inattentive time when no face is detected
    const updatedMetrics = {
      ...currentMetrics,
      attentionTimeOff: currentMetrics.attentionTimeOff + timeDelta,
      isAttentive: false,
      isSmiling: false
    };
    
    this.metricsSubject.next(updatedMetrics);
  }

  private processDetection(detection: any, timeDelta: number): void {
    const currentMetrics = this.metricsSubject.value;
    
    // Get the strongest emotion
    const expressions = detection.expressions;
    const strongestEmotion = this.getStrongestEmotion(expressions);
    
    // Check if user is looking at camera (attentive)
    const isAttentive = this.isLookingAtCamera(detection.landmarks);
    
    // Handle attention tracking
    let attentionTimeOn = currentMetrics.attentionTimeOn;
    let attentionTimeOff = currentMetrics.attentionTimeOff;
    
    if (isAttentive) {
      attentionTimeOn += timeDelta;
      // Transition from inattentive to attentive
      if (!this.wasAttentive) {
        this.wasAttentive = true;
      }
    } else {
      attentionTimeOff += timeDelta;
      // Transition from attentive to inattentive
      if (this.wasAttentive) {
        this.wasAttentive = false;
      }
    }
    
    // Check if smiling
    const isSmiling = expressions.happy > 0.7; // Threshold for smile detection
    let smileCount = currentMetrics.smileCount;
    let smileDuration = currentMetrics.smileDuration;
    
    // Handle smile detection
    if (isSmiling) {
      smileDuration += timeDelta;
      // Transition from not smiling to smiling
      if (!this.wasSmiling) {
        this.wasSmiling = true;
        smileCount++;
      }
    } else if (this.wasSmiling) {
      // Transition from smiling to not smiling
      this.wasSmiling = false;
    }
    
    // Update metrics
    this.metricsSubject.next({
      attentionTimeOn,
      attentionTimeOff,
      smileCount,
      smileDuration,
      currentEmotion: strongestEmotion.emotion,
      emotionConfidence: strongestEmotion.confidence,
      isAttentive,
      isSmiling
    });
  }

  private getStrongestEmotion(expressions: any): { emotion: string, confidence: number } {
    let strongestEmotion = 'neutral';
    let highestConfidence = expressions.neutral || 0;
    
    Object.keys(expressions).forEach(emotion => {
      if (expressions[emotion] > highestConfidence) {
        highestConfidence = expressions[emotion];
        strongestEmotion = emotion;
      }
    });
    
    return { emotion: strongestEmotion, confidence: highestConfidence };
  }

  private isLookingAtCamera(landmarks: any): boolean {
    // This is a simplified approach - in a production system
    // you might want a more sophisticated algorithm
    
    // Get eye landmarks
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    // Calculate eye aspect ratio (EAR) to detect if eyes are open
    const leftEAR = this.calculateEyeAspectRatio(leftEye);
    const rightEAR = this.calculateEyeAspectRatio(rightEye);
    const earAvg = (leftEAR + rightEAR) / 2;
    
    // Check face orientation based on nose and eyes position
    const nose = landmarks.getNose();
    const faceOrientation = this.checkFaceOrientation(leftEye, rightEye, nose);
    
    // Combine metrics - eyes need to be open and face properly oriented
    return earAvg > 0.2 && faceOrientation;
  }

  private calculateEyeAspectRatio(eyePoints: any[]): number {
    // Eye aspect ratio calculation based on the landmark points
    // Higher value means eyes are more open
    const height1 = this.distance(eyePoints[1], eyePoints[5]);
    const height2 = this.distance(eyePoints[2], eyePoints[4]);
    const width = this.distance(eyePoints[0], eyePoints[3]);
    
    return (height1 + height2) / (2.0 * width);
  }

  private checkFaceOrientation(leftEye: any[], rightEye: any[], nose: any[]): boolean {
    // Calculate centers
    const leftEyeCenter = this.getCentroid(leftEye);
    const rightEyeCenter = this.getCentroid(rightEye);
    const noseCenter = this.getCentroid(nose);
    
    // Check horizontal alignment (nose should be between eyes)
    const isHorizontalAligned = 
      noseCenter.x > leftEyeCenter.x - 10 && 
      noseCenter.x < rightEyeCenter.x + 10;
    
    // Check vertical alignment (nose below eyes)
    const isVerticalAligned = 
      noseCenter.y > leftEyeCenter.y && 
      noseCenter.y > rightEyeCenter.y;
    
    return isHorizontalAligned && isVerticalAligned;
  }

  private getCentroid(points: any[]): { x: number, y: number } {
    let sumX = 0;
    let sumY = 0;
    
    points.forEach(point => {
      sumX += point.x;
      sumY += point.y;
    });
    
    return {
      x: sumX / points.length,
      y: sumY / points.length
    };
  }

  private distance(point1: any, point2: any): number {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + 
      Math.pow(point1.y - point2.y, 2)
    );
  }

  stopAnalysis(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  getFormattedMetrics(): any {
    const metrics = this.metricsSubject.value;
    return {
      attentionTimeOn: this.formatTime(metrics.attentionTimeOn),
      attentionTimeOff: this.formatTime(metrics.attentionTimeOff),
      attentionPercent: this.calculatePercentage(
        metrics.attentionTimeOn, 
        metrics.attentionTimeOn + metrics.attentionTimeOff
      ),
      smileDuration: this.formatTime(metrics.smileDuration),
      smileCount: metrics.smileCount,
      currentEmotion: metrics.currentEmotion,
      isAttentive: metrics.isAttentive,
      isSmiling: metrics.isSmiling
    };
  }

  private formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private calculatePercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  }
}