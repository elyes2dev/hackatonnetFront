import { Injectable } from '@angular/core';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GestureService {
  private hands!: Hands;
  private camera!: Camera;
  private gestureCallback: ((gesture: string) => void) | null = null;
  
  // Add a Subject to handle gesture detection with debounce
  private gestureSubject = new Subject<string>();
  
  // Track the last detected gesture time to prevent too frequent updates
  private lastGestureTime = 0;
  private gestureDebounceTime = 2000; // 2 seconds between gestures

  constructor() {
    this.initHandTracking();
    
    // Subscribe to the gesture subject with debounce time
    this.gestureSubject.pipe(
      debounceTime(1000) // Debounce for 1 second
    ).subscribe(gesture => {
      if (this.gestureCallback) {
        this.gestureCallback(gesture);
      }
    });
  }

  private initHandTracking() {
    this.hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
  
    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });
  
    this.hands.onResults((results) => {
      try {
        this.handleResults(results);
      } catch (error) {
        console.error('MediaPipe results error:', error);
      }
    });
  }
  
  startDetection(videoElement: HTMLVideoElement, callback: (gesture: string) => void) {
    this.gestureCallback = callback;
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });
    this.camera.start();
  }

  private handleResults(results: Results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      return;
    }
  
    try {
      const landmarks = results.multiHandLandmarks[0];
      if (!landmarks || landmarks.length < 21) {
        return;
      }
      
      // Check if enough time has passed since last gesture
      const currentTime = Date.now();
      if (currentTime - this.lastGestureTime < this.gestureDebounceTime) {
        return;
      }

      if (this.isPeaceGesture(landmarks) || this.isAlternativePeaceGesture(landmarks)) {
        this.lastGestureTime = currentTime;
        this.gestureSubject.next('peace');
      } else if (this.isThumbsUp(landmarks)) {
        this.lastGestureTime = currentTime;
        this.gestureSubject.next('thumbs_up');
      } else if (this.isOpenPalm(landmarks)) {
        this.lastGestureTime = currentTime;
        this.gestureSubject.next('open_palm');
      } else if (this.isHeartGesture(landmarks)) {
        this.lastGestureTime = currentTime;
        this.gestureSubject.next('heart');
      }
    } catch (error) {
      console.error('Gesture detection error:', error);
    }
  }
  
  private isThumbsUp(landmarks: any): boolean {
    if (!landmarks || landmarks.length < 9) return false;
    
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12]; 
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    // Check if thumb is pointing up
    const thumbUp = thumbTip.y < landmarks[2].y;
    
    // Check if other fingers are curled (not extended)
    const fingersDown = 
      indexTip.y > landmarks[5].y && 
      middleTip.y > landmarks[9].y && 
      ringTip.y > landmarks[13].y && 
      pinkyTip.y > landmarks[17].y;
    
    return thumbUp && fingersDown;
  }

  private isOpenPalm(landmarks: any): boolean {
    // Improved open palm detection logic
    if (!landmarks) return false;
    
    // Check if fingers are extended
    const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky tips
    const mcp = [5, 9, 13, 17]; // Metacarpophalangeal joints (base of fingers)
    
    let extendedFingers = 0;
    for (let i = 0; i < fingerTips.length; i++) {
      // If fingertip is higher than the base (lower y value), finger is extended
      if (landmarks[fingerTips[i]].y < landmarks[mcp[i]].y) {
        extendedFingers++;
      }
    }
    
    return extendedFingers >= 3; // Consider it an open palm if at least 3 fingers are extended
  }


// Add to GestureService.ts
private isHeartGesture(landmarks: any): boolean {
  if (!landmarks || landmarks.length < 21) return false;
  
  // Get relevant landmarks for all fingers
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  // Get the base landmarks
  const wrist = landmarks[0];
  const thumbCmc = landmarks[1]; // Thumb base
  const indexMcp = landmarks[5]; // Index finger base
  
  // For a heart shape:
  // 1. Thumb and index should form a curved shape
  // 2. Middle, ring, and pinky fingers should be curled
  // 3. The thumb and index tips should be close but not touching
  
  // Check if middle, ring, and pinky are curled
  const middleCurled = middleTip.y > landmarks[9].y; // Middle finger curled
  const ringCurled = ringTip.y > landmarks[13].y;    // Ring finger curled
  const pinkyCurled = pinkyTip.y > landmarks[17].y;  // Pinky finger curled
  
  // Check if thumb and index are extended
  const thumbExtended = (thumbTip.y < thumbCmc.y);
  const indexExtended = (indexTip.y < indexMcp.y);
  
  // Calculate the angle between thumb tip, wrist, and index tip
  // This is key for detecting the curved heart shape
  const angle = this.calculateAngle(thumbTip, wrist, indexTip);
  
  // The distance between thumb and index tips should be small but not zero
  const tipDistance = this.distanceBetweenPoints(thumbTip, indexTip);
  
  // For debugging
  console.log("Heart detection values:", {
    angle,
    tipDistance,
    thumbExt: thumbExtended,
    indexExt: indexExtended,
    middleCurled,
    ringCurled,
    pinkyCurled
  });
  
  // Heart gesture conditions:
  // - Angle between 30-90 degrees (forming heart curve)
  // - Thumb and index extended
  // - Other fingers curled
  // - Tips at an appropriate distance
  return (angle >= 30 && angle <= 90) &&
         thumbExtended && 
         indexExtended && 
         middleCurled && 
         ringCurled && 
         pinkyCurled &&
         tipDistance < 0.2 && 
         tipDistance > 0.02;
}

// Helper methods for heart gesture detection
private calculateAngle(pointA: any, pointB: any, pointC: any): number {
  // Calculate vectors
  const vectorBA = { 
    x: pointA.x - pointB.x, 
    y: pointA.y - pointB.y 
  };
  const vectorBC = { 
    x: pointC.x - pointB.x, 
    y: pointC.y - pointB.y 
  };
  
  // Calculate dot product
  const dotProduct = (vectorBA.x * vectorBC.x) + (vectorBA.y * vectorBC.y);
  
  // Calculate magnitudes
  const magnitudeBA = Math.sqrt(vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y);
  const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);
  
  // Calculate angle in radians and convert to degrees
  const angleRadians = Math.acos(dotProduct / (magnitudeBA * magnitudeBC));
  return angleRadians * (180 / Math.PI);
}

private distanceBetweenPoints(pointA: any, pointB: any): number {
  return Math.sqrt(
    Math.pow(pointA.x - pointB.x, 2) + 
    Math.pow(pointA.y - pointB.y, 2)
  );
}

private isPeaceGesture(landmarks: any): boolean {
  if (!landmarks || landmarks.length < 21) return false;
  
  // Get finger tips and middle knuckles
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  const indexMid = landmarks[6];
  const middleMid = landmarks[10];
  const ringMid = landmarks[14];
  const pinkyMid = landmarks[18];
  
  // Check if index and middle fingers are extended
  // (fingertip should be higher than middle knuckle - smaller y value)
  const indexExtended = indexTip.y < indexMid.y;
  const middleExtended = middleTip.y < middleMid.y;
  
  // Check if ring and pinky fingers are not fully extended
  // (less strict than before - they don't need to be fully curled)
  const ringNotExtended = ringTip.y > (ringMid.y - 0.05); // Allow some extension
  const pinkyNotExtended = pinkyTip.y > (pinkyMid.y - 0.05); // Allow some extension
  
  // Calculate horizontal distance between index and middle fingertips
  // Peace sign typically has these fingers spread apart
  const fingerSpread = Math.abs(indexTip.x - middleTip.x);
  const goodSpread = fingerSpread > 0.05; // Minimum spread required
  
  // For debugging
  console.log("Peace detection values:", {
    indexExt: indexExtended,
    middleExt: middleExtended,
    ringNotExt: ringNotExtended,
    pinkyNotExt: pinkyNotExtended,
    spread: fingerSpread,
    goodSpread
  });
  
  // Return true if all conditions are met
  return indexExtended && 
         middleExtended && 
         (ringNotExtended || pinkyNotExtended) && // Relax this requirement
         goodSpread;
}

private isAlternativePeaceGesture(landmarks: any): boolean {
  if (!landmarks || landmarks.length < 21) return false;
  
  // Get fingertips
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  // Get finger bases (MCP joints)
  const indexBase = landmarks[5];
  const middleBase = landmarks[9];
  const ringBase = landmarks[13];
  const pinkyBase = landmarks[17];
  
  // Get palm center for reference (average of bases)
  const palmX = (indexBase.x + middleBase.x + ringBase.x + pinkyBase.x) / 4;
  const palmY = (indexBase.y + middleBase.y + ringBase.y + pinkyBase.y) / 4;
  
  // Simple approach: Check vertical position of fingertips
  // For peace sign, index and middle should be significantly higher than ring and pinky
  
  // Calculate average y-position of index+middle vs ring+pinky
  const extendedFingerY = (indexTip.y + middleTip.y) / 2;
  const curledFingerY = (ringTip.y + pinkyTip.y) / 2;
  
  // The difference should be substantial for a peace sign
  const yDifference = curledFingerY - extendedFingerY;
  
  // All fingertips should be above palm baseline for proper hand orientation
  const properOrientation = indexTip.y < palmY && middleTip.y < palmY;
  
  // Check if index and middle are separated enough horizontally
  const horizontalGap = Math.abs(indexTip.x - middleTip.x);
  
  console.log("Alternative peace detection:", {
    yDiff: yDifference,
    orientation: properOrientation,
    hGap: horizontalGap
  });
  
  return yDifference > 0.15 && // Extended vs curled difference
         properOrientation &&  // Hand orientation
         horizontalGap > 0.05; // Fingers spread in V shape
}



  stopDetection() {
    if (this.camera) this.camera.stop();
  }

}