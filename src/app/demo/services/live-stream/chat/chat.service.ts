import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface ChatMessage {
  sender: string;
  text: string;
  isHandRaised?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages: ChatMessage[] = [];
  messages$ = new Subject<ChatMessage[]>();
  private storageKey = 'video-chat-messages';

  constructor() {
    this.loadMessages();
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
  }

  private loadMessages() {
    const saved = localStorage.getItem(this.storageKey);
    this.messages = saved ? JSON.parse(saved) : [];
    this.messages$.next(this.messages);
  }

  private saveMessages() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    this.messages$.next(this.messages);
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key === this.storageKey) {
      this.loadMessages();
    }
  }

  addMessage(sender: string, text: string) {
    this.messages.push({ sender, text });
    this.saveMessages();
  }

  raiseHand(sender: string) {
    this.messages.push({ 
      sender, 
      text: 'raised hand', 
      isHandRaised: true 
    });
    this.saveMessages();
  }

  clearMessages() {
    this.messages = [];
    localStorage.removeItem(this.storageKey);
    this.messages$.next(this.messages);
  }

  setRoom(roomId: string) {
    this.storageKey = `video-chat-messages-${roomId}`;
    this.loadMessages();
  }
}