import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-live-stream',
  templateUrl: './live-stream.component.html',
  styleUrls: ['./live-stream.component.scss']
})
export class LiveStreamComponent {
  constructor(private router: Router) {}

  startCall() {
    this.router.navigate(['/call/:roomId']);
  }

}
