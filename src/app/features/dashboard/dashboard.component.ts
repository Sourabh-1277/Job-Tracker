import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { ApplicationStatus, JobApplication } from '../../core/model/job.model';
import { JobDialogComponent } from '../../shared/components/job-dialog/job-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Signals for reactive state and derived statistics
  allUserJobs = signal<JobApplication[]>([]);
  searchTerm = signal('');
  statusFilter = signal<ApplicationStatus | 'ALL'>('ALL');

  searchControl = new FormControl('');
  private subscriptions = new Subscription();

  // Computed statistics cards
  stats = computed(() => {
    const jobs = this.allUserJobs();
    return {
      total: jobs.length,
      applied: jobs.filter(j => j.status === 'Applied').length,
      interview: jobs.filter(j => j.status === 'Interview').length,
      offer: jobs.filter(j => j.status === 'Offer').length,
      rejected: jobs.filter(j => j.status === 'Rejected').length
    };
  });

  // Computed filtered list
  filteredJobs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();

    return this.allUserJobs().filter(job => {
      const matchesStatus = status === 'ALL' || job.status === status;
      const matchesSearch =
        !term ||
        job.company.toLowerCase().includes(term) ||
        job.position.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  });

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    // Subscribe to jobs stream
    const jobsSub = this.jobService.getJobsByUser(currentUser.id).subscribe(jobs => {
      this.allUserJobs.set(jobs);
    });
    this.subscriptions.add(jobsSub);

    // RxJS debounced search input
    const searchSub = this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(value => {
        this.searchTerm.set(value || '');
      });
    this.subscriptions.add(searchSub);
  }

  openAddDialog(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    const dialogRef = this.dialog.open(JobDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const payload = {
          ...result,
          userId: currentUser.id,
          candidateName: currentUser.fullName
        };
        this.jobService.addJob(payload).subscribe(() => {
          this.snackBar.open('Application added!', 'Close', { duration: 2500 });
        });
      }
    });
  }

  openEditDialog(job: JobApplication): void {
    const dialogRef = this.dialog.open(JobDialogComponent, {
      width: '600px',
      data: { job }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updated: JobApplication = { ...job, ...result };
        this.jobService.updateJob(updated).subscribe(() => {
          this.snackBar.open('Application updated!', 'Close', { duration: 2500 });
        });
      }
    });
  }

  deleteApplication(jobId: string): void {
    if (confirm('Remove this job application?')) {
      this.jobService.deleteJob(jobId).subscribe(() => {
        this.snackBar.open('Application deleted', 'Close', { duration: 2000 });
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}