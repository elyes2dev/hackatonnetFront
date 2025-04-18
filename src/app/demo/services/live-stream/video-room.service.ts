import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private mockRooms: string[] = ['test123', 'abc456', 'def789'];

  getRandomRoom(): string {
    return this.mockRooms[Math.floor(Math.random() * this.mockRooms.length)];
  }
}