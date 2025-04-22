import { Resources } from './resources.model';  // Ensure this import path is correct

export enum TypeDocument {
    PNG = 'PNG',
    PDF = 'PDF',
    JPEG = 'JPEG',
    JPG = 'JPG'
}

export interface Document {
    id: number;
    name: string;
    filePath: string;
    fileType: string;  // Assumed to represent MIME types or similar
    fileSize: number;
    type: TypeDocument;
    resource: Resources;
}