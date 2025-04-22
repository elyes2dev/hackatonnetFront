import { Quiz } from "./quiz.model";
import { Resources } from "./resources.model";
import { ThemeEnum } from "./theme.enum";
import { User } from "./user.model";

export interface Workshop {
    id: number;
    name: string;
    description: string;
    photo: string;
    theme: ThemeEnum;  // Assume ThemeEnum is defined elsewhere
    user?: User;  // Relation to the User who created the workshop
    resources: Resources[];  // Assume Resource is another defined interface
    quiz: Quiz | null;  // The quiz associated with the workshop, can be null
    // Additional properties can be added as needed
}