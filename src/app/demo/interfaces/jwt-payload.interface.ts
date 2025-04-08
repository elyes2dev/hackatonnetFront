import { JwtPayload } from "jwt-decode";

export interface CustomJwtPayload extends JwtPayload {
    roles?: string[];
    userid?: string; // Add other custom properties as needed
}
