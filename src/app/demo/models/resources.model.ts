import { Workshop } from './workshop.model';
  // Assume this interface exists
import { SkillEnum } from './skill.enum';
import { Document } from './document.model';
import { ImageModel } from './image.model';

// Assume SkillEnum is defined elsewhere in your project
export interface Resources {
    id: number;
    name: string;
    description: string;
    niveau: SkillEnum;  // Enum representing skill level
    image: string;
    workshop: Workshop;
    documents: Array<Document>;
    images: Array<ImageModel>;
}