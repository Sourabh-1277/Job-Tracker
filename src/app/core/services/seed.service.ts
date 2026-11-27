import { Injectable } from '@angular/core';
import { User } from '../model/user.model';
import { JobApplication } from '../model/job.model';

@Injectable({
  providedIn: 'root'
})
export class SeedService {
  readonly USERS_KEY = 'jt_users_v1';
  readonly JOBS_KEY = 'jt_jobs_v1';

  initializeDemoData(): void {
    if (!localStorage.getItem(this.USERS_KEY)) {
      const demoUsers: User[] = [
        {
          id: 'u-101',
          fullName: 'Aarav Sharma',
          email: 'candidate@demo.com',
          password: 'password123',
          role: 'CANDIDATE',
          createdAt: '2026-10-01T10:00:00Z'
        },
        {
          id: 'u-102',
          fullName: 'Priya Nair (Mentor)',
          email: 'admin@demo.com',
          password: 'password123',
          role: 'ADMIN',
          createdAt: '2026-09-15T09:30:00Z'
        }
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(demoUsers));
    }

    if (!localStorage.getItem(this.JOBS_KEY)) {
      const demoJobs: JobApplication[] = [
        {
          id: 'job-1',
          userId: 'u-101',
          candidateName: 'Aarav Sharma',
          company: 'Razorpay',
          position: 'Frontend Engineer - Angular',
          location: 'Bengaluru (Hybrid)',
          ctcOrSalary: '14 LPA',
          status: 'Interview',
          appliedDate: '2026-11-12',
          jobUrl: 'https://razorpay.com/jobs',
          notes: 'Cleared DSA + JS fundamentals round. Technical Angular round scheduled next.',
          mentorFeedback: 'Revise RxJS flattening operators and ChangeDetectionStrategy.OnPush.'
        },
        {
          id: 'job-2',
          userId: 'u-101',
          candidateName: 'Aarav Sharma',
          company: 'Zoho Corp',
          position: 'UI Developer',
          location: 'Chennai',
          ctcOrSalary: '9.5 LPA',
          status: 'Applied',
          appliedDate: '2026-11-18',
          notes: 'Applied via career portal with updated portfolio link.'
        },
        {
          id: 'job-3',
          userId: 'u-101',
          candidateName: 'Aarav Sharma',
          company: 'Freshworks',
          position: 'Software Engineer (Frontend)',
          location: 'Remote',
          ctcOrSalary: '12 LPA',
          status: 'Offer',
          appliedDate: '2026-10-25',
          notes: 'Received verbal offer; waiting for formal letter.',
          mentorFeedback: 'Strong performance! Compare benefits before signing.'
        },
        {
          id: 'job-4',
          userId: 'u-101',
          candidateName: 'Aarav Sharma',
          company: 'cred.club',
          position: 'Frontend Web Developer',
          location: 'Bengaluru',
          ctcOrSalary: '18 LPA',
          status: 'Rejected',
          appliedDate: '2026-10-14',
          notes: 'Rejected after machine coding round due to time constraints.'
        }
      ];
      localStorage.setItem(this.JOBS_KEY, JSON.stringify(demoJobs));
    }
  }
}