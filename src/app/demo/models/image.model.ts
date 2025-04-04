import { Resources } from './resources.model';  // Ensure this import path is correct

export interface ImageModel {
    id_image: number;
    path: string;
    type: string;
    picByte?: Uint8Array;

}