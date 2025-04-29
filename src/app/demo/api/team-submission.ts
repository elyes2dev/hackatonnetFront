export interface TeamSubmission {
   
    id?: number;
    projectName: string;
    description: string;
    repoLink: string;
    teamMember?: { id: number };
    submissionDate?: Date;
    donationAmount?: number;
    technologies?: string;
    // Note: These fields are kept for frontend validation but are not sent to the backend
    hackathonId?: number; // Not recognized by backend
    teamId?: number; // Not recognized by backend
  }