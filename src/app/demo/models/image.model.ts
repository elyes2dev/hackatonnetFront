import { Resources } from './resources.model';  // Ensure this import path is correct

export interface ImageModel {
    id: number;
    name: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    resource: Resources;
}