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

  private apiUrl = 'http://localhost:9100/pi/api/workshops';  // Base URL for Resources API

  constructor(private http: HttpClient) { }

  createResource(workshopId: number, resource: Resources, documents?: File[], images?: File[]): Observable<Resources> {
    const formData: FormData = new FormData();
    formData.append('resource', JSON.stringify(resource));

    if (documents) {
      documents.forEach((document, index) => formData.append(`documents[${index}]`, document));
    }

    if (images) {
      images.forEach((image, index) => formData.append(`images[${index}]`, image));
    }

    const headers = new HttpHeaders().set('enctype', 'multipart/form-data');
    return this.http.post<Resources>(`${this.apiUrl}/${workshopId}/resources`, formData, { headers });
  }

  getResource(workshopId: number, resourceId: number): Observable<Resources> {
    return this.http.get<Resources>(`${this.apiUrl}/${workshopId}/resources/${resourceId}`);
  }

  getAllResources(workshopId: number): Observable<Resources[]> {
    return this.http.get<Resources[]>(`${this.apiUrl}/${workshopId}/resources`);
  }

  updateResource(workshopId: number, resourceId: number, resourceDetails: Resources): Observable<Resources> {
    return this.http.put<Resources>(`${this.apiUrl}/${workshopId}/resources/${resourceId}`, resourceDetails);
  }

  deleteResource(workshopId: number, resourceId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${workshopId}/resources/${resourceId}`);
  }

  uploadDocument(resourceId: number, file: File): Observable<Document> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<Document>(`${this.apiUrl}/resources/${resourceId}/documents`, formData);
  }

  uploadImage(resourceId: number, file: File): Observable<ImageModel> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<ImageModel>(`${this.apiUrl}/resources/${resourceId}/images`, formData);
  }

  downloadDocument(resourceId: number, documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/resources/${resourceId}/documents/${documentId}/download`, { responseType: 'blob' });
  }
}