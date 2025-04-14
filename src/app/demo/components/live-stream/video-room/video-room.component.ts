import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.scss']
})
export class VideoRoomComponent implements OnInit {
  localStream!: MediaStream;
  roomId: string = 'test123'; // Hardcoded for testing
  isMicMuted = false;
  isCameraOff = false;

  

  async ngOnInit() {
    await this.setupLocalStream();
    this.generateRoomId(); // Optional for testing
  }

  private async setupLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
    } catch (err) {
      console.error('Error accessing media:', err);
      alert('Camera/mic access denied');
    }
  }

  toggleMic() {
    this.isMicMuted = !this.isMicMuted;
    this.localStream.getAudioTracks()[0].enabled = !this.isMicMuted;
  }

  toggleCamera() {
    this.isCameraOff = !this.isCameraOff;
    this.localStream.getVideoTracks()[0].enabled = !this.isCameraOff;
  }

  // Mock room ID generator (replace with backend later)
   generateRoomId() {
    this.roomId = Math.random().toString(36).substring(2, 8);
  }
}