import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Peer, MediaConnection } from 'peerjs';
import { ChatService } from 'src/app/demo/services/live-stream/chat/chat.service';
import { GestureService } from 'src/app/demo/services/live-stream/gesture/gesture.service';
import { FacialAnalysisService } from 'src/app/demo/services/live-stream/facial-analysis/facial-analysis.service';

interface Participant {
  id: string;
  stream: MediaStream;
  name: string;
}

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.scss'],
  animations: [
    trigger('fadeInOut', [
        state('void', style({ opacity: 0 })),
        transition(':enter, :leave', [
            animate('300ms ease-in-out')
        ])
    ])
  ]
})
export class VideoRoomComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('localVideo', { static: false }) localVideo!: ElementRef<HTMLVideoElement>;
  currentGesture: string | null = null;
  isGestureDetectionReady = false;
  gestureDisplayTimeout: any = null;
  
  // New facial analysis flags
  isFacialAnalysisEnabled = false;
  isFacialAnalysisReady = false;
  showFacialMetrics = false;
  
  // Streams
  localStream!: MediaStream;
  screenStream: MediaStream | null = null;
  participants: Participant[] = [];
  
  // States
  roomId = '';
  isMicMuted = false;
  isCameraOff = false;
  isSharingScreen = false;

  hackathonId = '';
  
  showChat = false;
  newMessage = '';
  isHandRaised = false;
  messages: any[] = [];

  constructor(
    private chatService: ChatService, 
    private route: ActivatedRoute, 
    private router: Router, 
    private gestureService: GestureService,
    private facialAnalysisService: FacialAnalysisService
  ) {}
  
  // PeerJS
  private peer!: Peer;
  private peers: Record<string, MediaConnection> = {};

  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.hackathonId = params.get('hackathonId') || '';
      this.roomId = params.get('roomId') || '';
      this.chatService.setRoom(this.roomId);
    });
    
    await this.setupLocalStream();
    this.initPeer();
    
    this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
    });
    
    // Initialize facial analysis models
    this.initializeFacialAnalysis();
  }

  async initializeFacialAnalysis() {
    try {
      await this.facialAnalysisService.loadModels();
      this.isFacialAnalysisReady = true;
      console.log('Facial analysis models loaded successfully');
    } catch (error) {
      console.error('Failed to load facial analysis models:', error);
    }
  }
  
  toggleFacialAnalysis() {
    if (!this.isFacialAnalysisReady || !this.localVideo?.nativeElement) {
      console.warn('Facial analysis not ready or video element not available');
      return;
    }
    
    this.isFacialAnalysisEnabled = !this.isFacialAnalysisEnabled;
    
    if (this.isFacialAnalysisEnabled) {
      this.facialAnalysisService.startAnalysis(this.localVideo.nativeElement);
      this.showFacialMetrics = true;
    } else {
      this.facialAnalysisService.stopAnalysis();
      this.showFacialMetrics = false;
    }
  }
  
  toggleFacialMetrics() {
    this.showFacialMetrics = !this.showFacialMetrics;
  }

  ngAfterViewInit() {
    this.initializeGestureDetection();
  }

  private async initializeGestureDetection() {
    if (!this.localVideo?.nativeElement) {
      setTimeout(() => this.initializeGestureDetection(), 100);
      return;
    }

    try {
      await this.gestureService.startDetection(
        this.localVideo.nativeElement,
        (gesture) => this.handleGesture(gesture)
      );
      this.isGestureDetectionReady = true;
    } catch (error) {
      console.error('Gesture detection failed:', error);
    }
  }

  private handleGesture(gesture: string) {
    try {
      // Clear any existing timeout for gesture indicator
      if (this.gestureDisplayTimeout) {
        clearTimeout(this.gestureDisplayTimeout);
      }
      
      // Set the current gesture to display the indicator
      this.currentGesture = gesture;
      
      // Only show the gesture in the top indicator, don't send to chat
      // No switch case needed since we're just showing the indicator
      
      // Auto-hide the gesture indicator after 8 seconds
      this.gestureDisplayTimeout = setTimeout(() => {
        this.currentGesture = null;
      }, 8000);
    } catch (error) {
      console.error('Gesture handling error:', error);
    }
  }

  private async setupLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (this.localVideo?.nativeElement) {
        this.localVideo.nativeElement.srcObject = this.localStream;
      }
    } catch (err) {
      console.error('Media error:', err);
      alert('Could not access camera/microphone');
    }
  }

  private initPeer() {
    this.peer = new Peer();

    this.peer.on('open', (id) => {
      const roomData = localStorage.getItem(this.roomId);
      const existingPeers = roomData ? JSON.parse(roomData) as string[] : [];
      
      existingPeers.forEach(peerId => {
        if (peerId !== id) this.connectToPeer(peerId);
      });
      
      localStorage.setItem(this.roomId, JSON.stringify([...existingPeers, id]));
    });

    this.peer.on('call', (call) => {
      call.answer(this.isSharingScreen ? this.screenStream! : this.localStream);
      
      call.on('stream', (remoteStream) => {
        this.addParticipant(call.peer, remoteStream);
      });

      call.on('close', () => {
        this.removeParticipant(call.peer);
      });
      
      this.peers[call.peer] = call;
    });
  }

  private connectToPeer(peerId: string) {
    if (this.peers[peerId]) return;

    const call = this.peer.call(peerId, this.isSharingScreen ? this.screenStream! : this.localStream);

    call.on('stream', (remoteStream) => {
      this.addParticipant(peerId, remoteStream);
    });

    call.on('close', () => {
      this.removeParticipant(peerId);
    });

    this.peers[peerId] = call;
  }

  private addParticipant(peerId: string, stream: MediaStream) {
    if (this.participants.some(p => p.id === peerId)) return;

    this.participants = [
      ...this.participants,
      {
        id: peerId,
        stream,
        name: `User ${this.participants.length + 1}`
      }
    ];
  }

  private removeParticipant(peerId: string) {
    this.participants = this.participants.filter(p => p.id !== peerId);
    delete this.peers[peerId];
  }

  toggleMic() {
    this.isMicMuted = !this.isMicMuted;
    this.localStream.getAudioTracks()[0].enabled = !this.isMicMuted;
  }
  toggleCamera() {
    this.isCameraOff = !this.isCameraOff;
    
    // Properly disable all video tracks
    const videoTracks = this.localStream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = !this.isCameraOff;
    });
    
    // Update the local video element display
    if (this.localVideo?.nativeElement) {
      // When camera is off, we'll still have the video element but the tracks will be disabled
      // We'll use CSS to show a placeholder when camera is off
      this.localVideo.nativeElement.classList.toggle('camera-off', this.isCameraOff);
    }
    
    // If camera is turned off, also stop facial analysis
    if (this.isCameraOff && this.isFacialAnalysisEnabled) {
      this.isFacialAnalysisEnabled = false;
      this.facialAnalysisService.stopAnalysis();
    }
  }


  async toggleScreenShare() {
    if (this.isSharingScreen) {
      await this.stopScreenShare();
    } else {
      await this.startScreenShare();
    }
  }

  private async startScreenShare() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      // Switch all peers to screen stream
      Object.values(this.peers).forEach(peer => {
        const videoSender = peer.peerConnection
          .getSenders()
          .find(s => s.track?.kind === 'video');
        
        if (videoSender) {
          videoSender.replaceTrack(this.screenStream!.getVideoTracks()[0]);
        }
      });

      this.isSharingScreen = true;
      
      // Stop facial analysis when screen sharing
      if (this.isFacialAnalysisEnabled) {
        this.isFacialAnalysisEnabled = false;
        this.facialAnalysisService.stopAnalysis();
      }
    } catch (err) {
      console.error('Screen share failed:', err);
    }
  }

  private async stopScreenShare() {
    this.screenStream?.getTracks().forEach(track => track.stop());
    
    // Restore camera stream for all peers
    Object.values(this.peers).forEach(peer => {
      const videoSender = peer.peerConnection
        .getSenders()
        .find(s => s.track?.kind === 'video');
      
      if (videoSender && this.localStream) {
        videoSender.replaceTrack(this.localStream.getVideoTracks()[0]);
      }
    });

    this.isSharingScreen = false;
    this.screenStream = null;
  }

  leaveCall() {
    if (this.gestureDisplayTimeout) {
      clearTimeout(this.gestureDisplayTimeout);
    }
    
    // Stop facial analysis
    if (this.isFacialAnalysisEnabled) {
      this.facialAnalysisService.stopAnalysis();
    }
    
    this.participants.forEach(p => {
      p.stream.getTracks().forEach(track => track.stop());
    });
    
    Object.values(this.peers).forEach(peer => peer.close());
    this.peer.destroy();

    this.chatService.clearMessages();
    this.router.navigate(['/live-stream', this.hackathonId]);
  }

  ngOnDestroy() {
    this.leaveCall();
    this.gestureService.stopDetection();
    this.facialAnalysisService.stopAnalysis();
  }

  toggleChat() {
    this.showChat = !this.showChat;
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.chatService.addMessage('You', this.newMessage);
      this.newMessage = '';
    }
  }

  toggleHandRaise() {
    this.isHandRaised = !this.isHandRaised;
    if (this.isHandRaised) {
      this.chatService.raiseHand('You');
    }
  }
}