import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TicketService } from './ticket.service';
import { Ticket } from '../models/ticket.model';
import { catchError, map, Observable, of } from 'rxjs';

// Define the AnalysisResult interface
export interface AnalysisResult {
  Summary: string;
  Classification: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TicketAIService {
  constructor(
    private http: HttpClient,
    private ticketService: TicketService
  ) { }

  apiUrl: string = "http://localhost:9100/api/tickets";

  geTicketDesc(ticket: Ticket) {
    let obj = {
      "text": ticket.description,
    }
    return this.http.post(`${this.apiUrl}/analyze`, obj);
  }

  // Updated method for analyzing multiple tickets
  analyzeTickets(tickets: Ticket[]): Observable<AnalysisResult> {
    // Combine all ticket descriptions into a single text string
    const combinedText = tickets.map(t => t.description).join("\n\n");
  
    // Create the object that matches what the backend expects
    const requestObj = {
      "text": combinedText
    };
  
    return this.http.post<AnalysisResult>(`${this.apiUrl}/analyze`, requestObj).pipe(
      map(response => {
        // Check if the response is a valid object
        if (response && typeof response === 'object') {
          // Ensure Classification is an array before calling .map
          const classification = Array.isArray(response.Classification) ? response.Classification : response.Classification ? [response.Classification] : [];
  
          return {
            Summary: response.Summary || 'No summarization available',
            Classification: classification.map((label: string) => label.trim()) // Apply .map after ensuring it's an array
          };
        } else {
          console.error('Unexpected response format:', response);
          return {
            Summary: 'Error parsing response',
            Classification: []
          };
        }
      }),
      catchError(error => {
        console.error('Batch analysis error', error);
        return of({
          Summary: 'Analysis failed. Please try again later.',
          Classification: []
        });
      })
    );
  }
  
  
}