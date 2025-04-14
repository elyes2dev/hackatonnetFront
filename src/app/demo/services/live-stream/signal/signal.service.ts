import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignalService {
  private peersInRoom: string[] = [];
  newPeer$ = new Subject<string>();

  addPeer(peerId: string) {
    this.peersInRoom.push(peerId);
    this.newPeer$.next(peerId);
  }

  getPeers() {
    return [...this.peersInRoom];
  }
}
