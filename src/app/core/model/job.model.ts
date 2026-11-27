export type ApplicationStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface JobApplication {
  id: string;
  userId: string;
  candidateName: string;
  company: string;
  position: string;
  location: string;
  ctcOrSalary: string;
  status: ApplicationStatus;
  appliedDate: string;
  jobUrl?: string;
  notes?: string;
  mentorFeedback?: string;
}