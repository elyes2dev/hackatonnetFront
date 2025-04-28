import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TeamDiscussionService } from './team-discussion.service';
import { MessageType as TeamDiscussionMessageType } from '../models/team-discussion';
import { StorageService } from './storage.service';

export interface GeminiRequest {
  prompt: string;
  teamContext?: string;
  maxTokens?: number;
  messageHistory?: Array<{role: string, content: string}>;
  teamId?: number;
  teamMemberId?: number;
  sessionId?: string;
}

export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GeminiAIService {
  // Using a different model and API endpoint
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';
  private readonly apiKey = 'AIzaSyAuE2jMayNerLnioIoVxXh3382lJHkD2Ag';
  
  // Store conversation history for each team
  private conversationHistories: { [teamId: string]: Array<{role: string, content: string, timestamp?: string}> } = {};
  
  // Store active session IDs for each team
  private sessionIds: { [teamId: string]: string } = {};
  
  // Store database message IDs to track persistence status
  private dbMessageIds: { [sessionId: string]: number[] } = {};
  
  constructor(
    private http: HttpClient,
    private teamDiscussionService: TeamDiscussionService,
    private storageService: StorageService
  ) {
    // Load conversation histories from local storage on initialization
    this.loadConversationHistories();
  }

  /**
   * Get Gemini AI response based on the provided prompt and context
   */
  getGeminiResponse(request: GeminiRequest): Observable<GeminiResponse> {
    // Only log essential information to reduce console clutter
    console.log('Sending request to Gemini AI for team context:', request.teamContext || 'default');
    
    if (!this.apiKey) {
      console.error('Gemini API key is not set');
      return throwError(() => new Error('Gemini API key is not set. Please configure your API key.'));
    }
    
    // Get team ID for conversation history
    const teamId = request.teamContext || 'default';
    const numericTeamId = request.teamId || 0;
    const teamMemberId = request.teamMemberId || 0;
    
    // Generate or retrieve session ID
    let sessionId = request.sessionId || this.sessionIds[teamId] || this.generateSessionId();
    this.sessionIds[teamId] = sessionId;
    
    // Initialize conversation history if needed
    if (!this.conversationHistories[teamId]) {
      this.conversationHistories[teamId] = [];
    }
    
    // Add the user's message to conversation history with timestamp
    const userMessage = {
      role: 'user',
      content: request.prompt,
      timestamp: new Date().toISOString(),
      sessionId: sessionId
    };
    
    this.conversationHistories[teamId].push(userMessage);
    
    // Save conversation history to storage
    this.saveConversationHistories();
    
    // Save user message to database if team ID is provided
    if (numericTeamId > 0 && teamMemberId > 0) {
      this.saveMessageToDatabase(numericTeamId, teamMemberId, `[Session: ${sessionId}] ${request.prompt}`, 'user');
    }
    
    // Keep history to last 10 messages to avoid token limits but maintain context
    if (this.conversationHistories[teamId].length > 10) {
      this.conversationHistories[teamId] = this.conversationHistories[teamId].slice(-10);
    }
    
    // Simplified request format
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are Gemini, a helpful AI assistant for a hackathon team${request.teamContext ? ' called "' + request.teamContext + '"' : ''}. Help with the following request: ${request.prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: request.maxTokens || 800,
        topP: 0.8,
        topK: 40
      }
    };
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<any>(`${this.apiUrl}?key=${this.apiKey}`, requestBody, { headers })
      .pipe(
        map(response => {
          // Only log success, not the entire response to reduce console noise
          console.log('Received successful response from Gemini API');
          
          if (response && response.candidates && response.candidates.length > 0 && 
              response.candidates[0].content && 
              response.candidates[0].content.parts && 
              response.candidates[0].content.parts.length > 0) {
            
            // Extract the text from the response
            const responseText = response.candidates[0].content.parts[0].text || '';
            
            // Add the assistant's response to conversation history with timestamp and session ID
            const assistantMessage = {
              role: 'gemini',
              content: responseText,
              timestamp: new Date().toISOString(),
              sessionId: this.sessionIds[teamId]
            };
            
            this.conversationHistories[teamId].push(assistantMessage);
            
            // Save conversation history to storage
            this.saveConversationHistories();
            
            // Save assistant message to database if team ID is provided
            if (request.teamId && request.teamId > 0) {
              // Get the current session ID for this team
              const currentSessionId = this.sessionIds[teamId];
              console.log(`Saving AI response for team ${request.teamId} with session ID ${currentSessionId}`);
              
              // Add session ID and timestamp to the message for better tracking
              const formattedResponse = responseText;
              
              // Use a special team member ID (0) for AI messages
              // Make multiple attempts to save the message to ensure persistence
              this.saveMessageToDatabase(request.teamId, 0, formattedResponse, 'gemini');
              
              // Make a second attempt after a delay to ensure it's saved
              setTimeout(() => {
                if (request.teamId && request.teamId > 0) {
                  console.log(`Making second attempt to save AI response to database for session ${currentSessionId}`);
                  this.saveMessageToDatabase(request.teamId, 0, formattedResponse, 'gemini');
                  
                  // Verify persistence by checking if the message IDs are tracked
                  if (this.dbMessageIds[currentSessionId] && this.dbMessageIds[currentSessionId].length > 0) {
                    console.log(`Session ${currentSessionId} has ${this.dbMessageIds[currentSessionId].length} tracked messages`);
                  } else {
                    console.warn(`No tracked messages found for session ${currentSessionId}, making final attempt`);
                    // Make a final attempt with a different approach
                    setTimeout(() => {
                      if (request.teamId) {
                        this.saveMessageToDatabase(request.teamId, 0, `[FINAL ATTEMPT] ${formattedResponse}`, 'gemini');
                      }
                    }, 1000);
                  }
                }
              }, 2000);
            }
            
            return {
              text: responseText,
              usage: {
                promptTokens: 0,  // Simplified usage tracking
                completionTokens: 0,
                totalTokens: 0
              }
            };
          } else {
            throw new Error('Invalid response format from Gemini API');
          }
        }),
        catchError(error => {
          // Enhanced error handling with more specific error messages
          console.error('Error calling Gemini API:', error);
          
          let errorMessage = 'Failed to get response from Gemini AI';
          
          // Check for common error patterns
          if (error.error?.error) {
            const apiError = error.error.error;
            
            if (apiError.code === 400) {
              errorMessage = 'Invalid request to Gemini API';
            } else if (apiError.code === 401) {
              errorMessage = 'Authentication error: Invalid API key';
            } else if (apiError.code === 403) {
              errorMessage = 'Access denied: Check API key permissions';
            } else if (apiError.code === 429) {
              errorMessage = 'Rate limit exceeded: Too many requests to Gemini API';
            } else if (apiError.code >= 500) {
              errorMessage = 'Gemini API server error: Please try again later';
            }
            
            if (apiError.message) {
              errorMessage += ': ' + apiError.message;
            }
          } else if (error.status) {
            // Handle HTTP status codes
            if (error.status === 0) {
              errorMessage = 'Network error: Unable to connect to Gemini API';
            } else {
              errorMessage += ` (HTTP ${error.status})`;
            }
          } else if (error.message) {
            errorMessage += ': ' + error.message;
          }
          
          // Return a fallback response instead of throwing an error
          return of(this.createFallbackResponse(request.prompt, errorMessage));
        })
      );
  }
  
  /**
   * Build a system prompt with context for better responses
   */
  private buildSystemPrompt(request: GeminiRequest): string {
    let systemPrompt = '';
    
    // Add team context if available
    if (request.teamContext) {
      systemPrompt += `You are a helpful AI assistant named Gemini for a hackathon team called "${request.teamContext}". `;
    } else {
      systemPrompt += 'You are a helpful AI assistant named Gemini for a hackathon team. ';
    }
    
    systemPrompt += 'You are conversational and maintain context throughout the chat. ';
    systemPrompt += 'You help the team with project ideas, code reviews, technical questions, and general conversation. ';
    systemPrompt += 'Provide helpful, concise, and accurate responses. ';
    systemPrompt += 'If you are asked about code, provide examples when appropriate. ';
    systemPrompt += 'Be friendly and engaging, like a real team member. ';
    
    return systemPrompt;
  }
  
  /**
   * Create a fallback response when the API fails
   * @param prompt The original prompt
   * @param errorMessage The error message
   */
  private createFallbackResponse(prompt: string, errorMessage: string): GeminiResponse {
    console.log('Creating fallback response for prompt:', prompt);
    
    // Create a helpful fallback message
    let fallbackText = `I'm currently experiencing technical difficulties connecting to my knowledge base. `;
    
    // Add more context based on the prompt
    if (prompt.toLowerCase().includes('code') || prompt.toLowerCase().includes('programming') || prompt.toLowerCase().includes('error')) {
      fallbackText += `It seems you're asking about code or programming. While I can't access my full capabilities right now, here are some general tips:\n\n`;
      fallbackText += `1. Check for syntax errors like missing semicolons, brackets, or quotes\n`;
      fallbackText += `2. Verify variable names and case sensitivity\n`;
      fallbackText += `3. Make sure all dependencies are properly imported\n`;
      fallbackText += `4. Look for null/undefined values\n`;
      fallbackText += `5. Check the browser console for specific error messages\n\n`;
      fallbackText += `I'll be able to provide more specific help once my connection is restored.`;
    } else if (prompt.toLowerCase().includes('idea') || prompt.toLowerCase().includes('hackathon') || prompt.toLowerCase().includes('project')) {
      fallbackText += `It looks like you're asking about hackathon project ideas. While I can't access my full capabilities right now, here are some general suggestions:\n\n`;
      fallbackText += `1. Consider projects related to sustainability, health tech, or education\n`;
      fallbackText += `2. Think about using technologies like AI, blockchain, or IoT\n`;
      fallbackText += `3. Focus on solving real-world problems that affect your community\n`;
      fallbackText += `4. Look for unique combinations of existing technologies\n`;
      fallbackText += `5. Consider the technical feasibility within your hackathon timeframe\n\n`;
      fallbackText += `I'll be able to provide more tailored suggestions once my connection is restored.`;
    } else {
      fallbackText += `I'm unable to provide a specific response to your query right now. Please try again later when my services are fully operational.\n\n`;
      fallbackText += `Technical details: ${errorMessage}`;
    }
    
    return {
      text: fallbackText,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }
    };
  }
  
  /**
   * Clear conversation history for a specific team
   */
  public clearConversationHistory(teamContext?: string): void {
    const teamId = teamContext || 'default';
    this.conversationHistories[teamId] = [];
    // Generate a new session ID when clearing history
    this.sessionIds[teamId] = this.generateSessionId();
    // Save the updated conversation histories
    this.saveConversationHistories();
  }
  
  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }
  
  /**
   * Save conversation histories to local storage
   */
  private saveConversationHistories(): void {
    try {
      // Save all session data to localStorage
      localStorage.setItem('gemini_conversation_histories', JSON.stringify(this.conversationHistories));
      localStorage.setItem('gemini_session_ids', JSON.stringify(this.sessionIds));
      localStorage.setItem('gemini_db_message_ids', JSON.stringify(this.dbMessageIds));
      
      // Log successful save
      console.log('Successfully saved conversation histories and session data to localStorage');
    } catch (error) {
      console.error('Error saving conversation histories to local storage:', error);
    }
  }
  
  /**
   * Load conversation histories from local storage
   */
  private loadConversationHistories(): void {
    try {
      // Load from localStorage
      const histories = localStorage.getItem('gemini_conversation_histories');
      const sessions = localStorage.getItem('gemini_session_ids');
      const dbIds = localStorage.getItem('gemini_db_message_ids');
      
      if (histories) {
        this.conversationHistories = JSON.parse(histories);
        console.log('Loaded conversation histories from localStorage');
      }
      
      if (sessions) {
        this.sessionIds = JSON.parse(sessions);
        console.log('Loaded session IDs from localStorage');
      }
      
      if (dbIds) {
        this.dbMessageIds = JSON.parse(dbIds);
        console.log('Loaded database message IDs from localStorage');
      }
      
      // Log session information
      const sessionCount = Object.keys(this.sessionIds).length;
      const messageIdCount = Object.values(this.dbMessageIds).reduce((sum, ids) => sum + ids.length, 0);
      console.log(`Loaded ${sessionCount} sessions with ${messageIdCount} tracked message IDs`);
    } catch (error) {
      console.error('Error loading conversation histories from local storage:', error);
    }
  }
  
  /**
   * Get the current session ID for a team
   */
  public getSessionId(teamContext?: string): string {
    const teamId = teamContext || 'default';
    if (!this.sessionIds[teamId]) {
      this.sessionIds[teamId] = this.generateSessionId();
      this.saveConversationHistories();
    }
    return this.sessionIds[teamId];
  }
  
  /**
   * Get conversation history for a specific team
   */
  public getConversationHistory(teamContext?: string): Array<{role: string, content: string, timestamp?: string}> {
    const teamId = teamContext || 'default';
    return this.conversationHistories[teamId] || [];
  }
  
  /**
   * Save a message to the database
   */
  private saveMessageToDatabase(teamId: number, teamMemberId: number, message: string, role: string): void {
    // Get the current session ID for this team
    const teamKey = teamId.toString() || 'default';
    const sessionId = this.sessionIds[teamKey] || this.generateSessionId();
    
    // Use the TeamDiscussionService to save the message
    const messageType = TeamDiscussionMessageType.TEXT;
    
    // Add role prefix and formatting for clarity in the database
    let formattedMessage = message;
    
    if (role === 'gemini') {
      // Format AI messages with clear AI indicator and preserve formatting
      formattedMessage = `[AI ASSISTANT] [Session: ${sessionId}] ${message}`;
    } else {
      // Format user messages to indicate they're part of an AI conversation
      if (!formattedMessage.includes('[Session:')) {
        formattedMessage = `[AI QUERY] [Session: ${sessionId}] ${message}`;
      }
    }
    
    // Initialize session tracking if needed
    if (!this.dbMessageIds[sessionId]) {
      this.dbMessageIds[sessionId] = [];
    }
    
    // Make multiple attempts to save the message to ensure persistence
    const saveMessage = () => {
      this.teamDiscussionService.sendMessage(teamId, teamMemberId, formattedMessage, messageType)
        .subscribe({
          next: (response) => {
            console.log(`${role} message saved to database:`, response);
            
            // Track the message ID in our session tracking
            if (response && response.id) {
              this.dbMessageIds[sessionId].push(response.id);
              this.saveConversationHistories(); // Save the updated tracking info
              console.log(`Message ID ${response.id} tracked in session ${sessionId}`);
            }
          },
          error: (error) => {
            console.error(`Failed to save ${role} message to database:`, error);
            // Retry once on failure after a short delay
            setTimeout(() => {
              console.log('Retrying to save message to database...');
              this.teamDiscussionService.sendMessage(teamId, teamMemberId, formattedMessage, messageType)
                .subscribe({
                  next: (response) => {
                    console.log(`Retry successful: ${role} message saved to database:`, response);
                    
                    // Track the message ID in our session tracking
                    if (response && response.id) {
                      this.dbMessageIds[sessionId].push(response.id);
                      this.saveConversationHistories(); // Save the updated tracking info
                      console.log(`Message ID ${response.id} tracked in session ${sessionId} (retry)`);
                    }
                  },
                  error: (retryError) => {
                    console.error(`Retry failed: ${role} message could not be saved:`, retryError);
                    // Make one final attempt with a different approach
                    this.finalAttemptSaveMessage(teamId, teamMemberId, formattedMessage, sessionId, role);
                  }
                });
            }, 1000);
          }
        });
    };
    
    // Execute the save operation
    saveMessage();
  }
  
  /**
   * Final attempt to save a message to the database
   */
  private finalAttemptSaveMessage(teamId: number, teamMemberId: number, message: string, sessionId: string, role: string): void {
    // Try a different approach for the final attempt
    const messageType = TeamDiscussionMessageType.TEXT;
    
    // Add extra indicators to show this was a recovery attempt
    const recoveryMessage = `[RECOVERY ATTEMPT] ${message}`;
    
    setTimeout(() => {
      console.log('Making final attempt to save message to database...');
      this.teamDiscussionService.sendMessage(teamId, teamMemberId, recoveryMessage, messageType)
        .subscribe({
          next: (response) => {
            console.log(`Final attempt successful: ${role} message saved to database:`, response);
            
            // Track the message ID in our session tracking
            if (response && response.id) {
              this.dbMessageIds[sessionId].push(response.id);
              this.saveConversationHistories(); // Save the updated tracking info
              console.log(`Message ID ${response.id} tracked in session ${sessionId} (final attempt)`);
            }
          },
          error: (finalError) => {
            console.error(`All attempts failed: ${role} message could not be saved:`, finalError);
          }
        });
    }, 2000);
  }
}
