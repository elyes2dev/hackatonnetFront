import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, delay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = `${environment.apiUrl}/donations`;
  private paymentApiUrl = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) { }

  /**
   * Create a payment intent with Stripe
   * @param amount Amount in cents
   * @param teamSubmissionId ID of the team submission being donated to
   * @param description Description of the payment
   */
  createPaymentIntent(amount: number, teamSubmissionId: string, description: string): Observable<any> {
    // MOCK IMPLEMENTATION - Replace with actual API call when backend is ready
    console.log('Creating mock payment intent for:', { amount, teamSubmissionId, description });
    
    // Generate a random client secret
    const mockClientSecret = 'pi_' + Math.random().toString(36).substring(2, 15) + '_secret_' + Math.random().toString(36).substring(2, 15);
    
    // Return a mock response with a delay to simulate network request
    return of({
      clientSecret: mockClientSecret,
      amount: amount,
      id: 'pi_' + Math.random().toString(36).substring(2, 15),
      status: 'succeeded'
    }).pipe(
      delay(800), // Add a delay to simulate network request
      tap(response => console.log('Mock payment intent created:', response))
    );
    
    // REAL IMPLEMENTATION - Uncomment when backend endpoint is available
    /*
    return this.http.post<any>(`${this.paymentApiUrl}/create-payment-intent`, {
      amount,
      teamSubmissionId,
      description
    }).pipe(
      tap(response => console.log('Payment intent created:', response)),
      catchError(this.handleError)
    );
    */
  }

  /**
   * Record a donation in the database after successful payment
   * @param donationData The donation data to record
   */
  recordDonation(donationData: any): Observable<any> {
    // MOCK IMPLEMENTATION - Replace with actual API call when backend is ready
    console.log('Recording mock donation:', donationData);
    
    // Return a mock response with a delay to simulate network request
    return of({
      id: Math.floor(Math.random() * 1000),
      ...donationData,
      createdAt: new Date().toISOString()
    }).pipe(
      delay(500), // Add a delay to simulate network request
      tap(response => console.log('Mock donation recorded:', response))
    );
    
    // REAL IMPLEMENTATION - Uncomment when backend endpoint is available
    /*
    return this.http.post<any>(this.apiUrl, donationData).pipe(
      tap(response => console.log('Donation recorded:', response)),
      catchError(this.handleError)
    );
    */
  }

  /**
   * Get donations for a specific team submission
   * @param teamSubmissionId ID of the team submission
   */
  getDonationsByTeamSubmission(teamSubmissionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/team-submission/${teamSubmissionId}`).pipe(
      tap(donations => console.log('Fetched donations:', donations)),
      catchError(this.handleError)
    );
  }

  /**
   * Get total donations amount for a team submission
   * @param teamSubmissionId ID of the team submission
   */
  getTotalDonationsForTeamSubmission(teamSubmissionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/team-submission/${teamSubmissionId}/total`).pipe(
      tap(total => console.log('Total donations:', total)),
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    throw error;
  }
}
