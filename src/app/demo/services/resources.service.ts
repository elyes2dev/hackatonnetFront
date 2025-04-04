import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resources } from '../models/resources.model';
import { Document } from '../models/document.model';
import { ImageModel } from '../models/image.model';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {

  private baseUrl = 'http://localhost:9100/pi/workshops';  // Base URL for Resources API

  constructor(private http: HttpClient) {}

  // Get all resources for a specific workshop
  getAllResources(workshopId: number): Observable<Resources[]> {
    console.log(`Making API request to: /api/workshops/${workshopId}/resources`);
    return this.http.get<Resources[]>(`${this.baseUrl}/${workshopId}/resources`);
  }

  // Get a specific resource by its ID
  getResource(workshopId: number, resourceId: number): Observable<Resources> {
    return this.http.get<Resources>(`${this.baseUrl}/${workshopId}/resources/${resourceId}`);
  }

  // Create a new resource
  createResource(workshopId: number, resource: Resources, documents: File[], images: File[]): Observable<any> {
    const formData = new FormData();
  
    // ✅ Add JSON stringified resource object
    formData.append('resource', JSON.stringify(resource));
  
    // ✅ Add each document file
    documents.forEach(doc => {
      formData.append('documents', doc);
    });
  
    // ✅ Add each image file
    images.forEach(img => {
      formData.append('images', img);
    });
  
    return this.http.post(`http://localhost:9100/pi/workshops/${workshopId}/resources`, formData);
  }

  // Update an existing resource
  updateResource(workshopId: number, resourceId: number, resource: Resources): Observable<Resources> {
    return this.http.put<Resources>(`${this.baseUrl}/${workshopId}/resources/${resourceId}`, resource);
  }

  // Delete a resource
  deleteResource(workshopId: number, resourceId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${workshopId}/resources/${resourceId}`);
  }

  // Upload a document to a resource
  uploadDocument(workshopId: number, resourceId: number, file: File): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<Document>(`${this.baseUrl}/${workshopId}/resources/${resourceId}/documents`, formData);
  }

  // Upload an image to a resource
  uploadImage(workshopId: number, resourceId: number, file: File): Observable<ImageModel> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ImageModel>(`${this.baseUrl}/${workshopId}/resources/${resourceId}/images`, formData);
  }

  // Download a document
  downloadDocument(workshopId: number, resourceId: number, documentId: number): Observable<Blob> {
    return this.http.get<Blob>(`${this.baseUrl}/${workshopId}/resources/${resourceId}/documents/${documentId}/download`, {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders().set('Accept', 'application/octet-stream')
    });
  }
}