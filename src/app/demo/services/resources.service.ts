import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resources } from '../models/resources.model';
import { Document } from '../models/document.model';
import { ImageModel } from '../models/image.model';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private baseUrl = 'http://localhost:9100/pi/workshops';

  constructor(private http: HttpClient) { }

  // Get all resources for a specific workshop
  getAllWorkshopResources(workshopId: number): Observable<Resources[]> {
    return this.http.get<Resources[]>(`${this.baseUrl}/${workshopId}/resources`);
  }

  // Get a specific resource by ID within a workshop
  getResourceById(workshopId: number, resourceId: number): Observable<Resources> {
    return this.http.get<Resources>(`${this.baseUrl}/${workshopId}/resources/${resourceId}`);
  }

  // Create a new resource with optional files
  createResource(
    workshopId: number, 
    resource: Resources, 
    files?: File[]
  ): Observable<Resources> {
    const formData = new FormData();
    formData.append('resource', JSON.stringify(resource));

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    }

    return this.http.post<Resources>(
      `${this.baseUrl}/${workshopId}/resources`,
      formData
    );
  }

  // Update a resource
  updateResource(
    workshopId: number, 
    resourceId: number, 
    resourceDetails: Resources
  ): Observable<Resources> {
    return this.http.put<Resources>(
      `${this.baseUrl}/${workshopId}/resources/${resourceId}`,
      resourceDetails
    );
  }

  // Delete a resource
  deleteResource(workshopId: number, resourceId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${workshopId}/resources/${resourceId}`
    );
  }

  // Upload images to an existing resource
  uploadImagesToResource(
    workshopId: number, 
    resourceId: number, 
    files: File[]
  ): Observable<Resources> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    return this.http.post<Resources>(
      `${this.baseUrl}/${workshopId}/resources/${resourceId}/images`,
      formData
    );
  }

  deleteResourceFile(workshopId: number, resourceId: number, fileId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${workshopId}/resources/${resourceId}/files/${fileId}`
    );
  }
}