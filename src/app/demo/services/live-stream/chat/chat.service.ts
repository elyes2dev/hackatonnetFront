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
  
  addMessage(sender: string, text: string) {
    this.messages.push({ sender, text });
    this.messages$.next(this.messages);
  }

  raiseHand(sender: string) {
    this.messages.push({ 
      sender, 
      text: 'raised hand', 
      isHandRaised: true 
    });
    this.messages$.next(this.messages);
  }

  clearMessages() {
    this.messages = [];
    this.messages$.next(this.messages);
  }
}