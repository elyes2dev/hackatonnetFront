import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Peer, MediaConnection } from 'peerjs';

interface Participant {
  id: string;
  stream: MediaStream;
  name: string;
}

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.scss']
})
export class VideoRoomComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  
  // Streams
  localStream!: MediaStream;
  screenStream: MediaStream | null = null;
  participants: Participant[] = [];
  
  // States
  roomId: string = 'test123';
  isMicMuted = false;
  isCameraOff = false;
  isSharingScreen = false;
  
  // PeerJS
  private peer!: Peer;
  private peers: { [id: string]: MediaConnection } = {};

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

  // Control Methods
  toggleMic() {
    this.isMicMuted = !this.isMicMuted;
    this.localStream.getAudioTracks()[0].enabled = !this.isMicMuted;
  }

  toggleCamera() {
    this.isCameraOff = !this.isCameraOff;
    this.localStream.getVideoTracks()[0].enabled = !this.isCameraOff;
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
    this.participants.forEach(p => {
      p.stream.getTracks().forEach(track => track.stop());
    });
    
    Object.values(this.peers).forEach(peer => peer.close());
    this.peer.destroy();
  }

  ngOnDestroy() {
    this.leaveCall();
  }
}