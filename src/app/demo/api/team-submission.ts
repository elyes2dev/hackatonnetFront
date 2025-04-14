export interface TeamSubmission {
   
    id?: number;
    projectName: string;
    description: string;
    repoLink: string;
    teamMember?: { id: number };
    submissionDate?: Date;
  }
  