import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Peer, MediaConnection } from 'peerjs'; // Correct import

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.scss']
})
export class VideoRoomComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  localStream!: MediaStream;
  roomId: string = 'test123';
  isMicMuted = false;
  isCameraOff = false;
  remoteStreams: MediaStream[] = [];
  
  private peer!: Peer;
  private peers: { [id: string]: MediaConnection } = {}; // Fixed type

  async ngOnInit() {
    await this.setupLocalStream();
    this.initPeer();
  }

  private async setupLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      this.localVideo.nativeElement.srcObject = this.localStream;
    } catch (err) {
      console.error('Error accessing media:', err);
      alert('Camera/mic access denied');
    }
  }

  private initPeer() {
    this.peer = new Peer();
  
    this.peer.on('open', (id) => {
      const roomData = localStorage.getItem(this.roomId);
      const existingPeers = roomData ? JSON.parse(roomData) as string[] : [];
      
      // Filter out duplicates and self
      const uniquePeers = [...new Set(existingPeers)].filter(peerId => peerId !== id);
      
      uniquePeers.forEach(peerId => this.connectToPeer(peerId));
      localStorage.setItem(this.roomId, JSON.stringify([...uniquePeers, id]));
    });
  
    this.peer.on('call', (call: MediaConnection) => {
      // Check if connection already exists
      if (!this.peers[call.peer]) {
        call.answer(this.localStream);
        call.on('stream', (remoteStream) => {
          // Prevent duplicate streams
          if (!this.remoteStreams.some(s => s.id === remoteStream.id)) {
            this.remoteStreams = [...this.remoteStreams, remoteStream];
          }
        });
        this.peers[call.peer] = call;
      }
    });
  }
  
  private connectToPeer(peerId: string) {
    if (this.peers[peerId] || peerId === this.peer.id) return;
    
    const call = this.peer.call(peerId, this.localStream);
    call.on('stream', (remoteStream) => {
      // Unique stream check
      if (!this.remoteStreams.some(s => s.id === remoteStream.id)) {
        this.remoteStreams = [...this.remoteStreams, remoteStream];
      }
    });
    this.peers[peerId] = call;
  }

  generateRoomId() {
    this.roomId = Math.random().toString(36).substring(2, 8);
    localStorage.removeItem('test123');
    this.remoteStreams = [];
    this.peers = {};
  }



  toggleMic() {
    this.isMicMuted = !this.isMicMuted;
    this.localStream.getAudioTracks()[0].enabled = !this.isMicMuted;
  }

  toggleCamera() {
    this.isCameraOff = !this.isCameraOff;
    this.localStream.getVideoTracks()[0].enabled = !this.isCameraOff;
  }

  ngOnDestroy() {
    this.peer?.destroy();
  }
}