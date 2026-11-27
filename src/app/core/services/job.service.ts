import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { JobApplication } from '../model/job.model';
import { SeedService } from './seed.service';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private seedService = inject(SeedService);

  // RxJS BehaviorSubject for reactive stream updates across components
  private jobsSubject = new BehaviorSubject<JobApplication[]>(this.readFromStorage());
  readonly jobs$ = this.jobsSubject.asObservable();

  private readFromStorage(): JobApplication[] {
    const raw = localStorage.getItem(this.seedService.JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private writeToStorage(jobs: JobApplication[]): void {
    localStorage.setItem(this.seedService.JOBS_KEY, JSON.stringify(jobs));
    this.jobsSubject.next(jobs);
  }

  getJobsByUser(userId: string): Observable<JobApplication[]> {
    return this.jobs$.pipe(
      map(jobs => jobs.filter(j => j.userId === userId))
    );
  }

  getAllJobs(): Observable<JobApplication[]> {
    return this.jobs$;
  }

  addJob(jobData: Omit<JobApplication, 'id'>): Observable<JobApplication> {
    const newJob: JobApplication = {
      ...jobData,
      id: 'job-' + Date.now()
    };

    return of(newJob).pipe(
      delay(250),
      tap(created => {
        const current = this.readFromStorage();
        this.writeToStorage([created, ...current]);
      })
    );
  }

  updateJob(updatedJob: JobApplication): Observable<JobApplication> {
    return of(updatedJob).pipe(
      delay(250),
      tap(item => {
        const current = this.readFromStorage();
        const index = current.findIndex(j => j.id === item.id);
        if (index !== -1) {
          current[index] = item;
          this.writeToStorage([...current]);
        }
      })
    );
  }

  deleteJob(jobId: string): Observable<boolean> {
    return of(true).pipe(
      delay(200),
      tap(() => {
        const filtered = this.readFromStorage().filter(j => j.id !== jobId);
        this.writeToStorage(filtered);
      })
    );
  }
}