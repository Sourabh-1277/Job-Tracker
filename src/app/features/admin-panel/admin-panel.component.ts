import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { JobApplication } from '../../core/model/job.model';
import { User } from '../../core/model/user.model';
import { JobDialogComponent } from '../../shared/components/job-dialog/job-dialog.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    DatePipe,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './admin-panel.component.html'
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  allJobs = signal<JobApplication[]>([]);
  allUsers = signal<User[]>([]);
  displayedColumns = ['candidate', 'company', 'position', 'status', 'appliedDate', 'actions'];

  private subs = new Subscription();

  platformMetrics = computed(() => {
    const jobs = this.allJobs();
    const candidates = this.allUsers().filter(u => u.role === 'CANDIDATE');
    const offers = jobs.filter(j => j.status === 'Offer').length;
    return {
      totalCandidates: candidates.length,
      totalApplications: jobs.length,
      totalOffers: offers
    };
  });

  ngOnInit(): void {
    this.subs.add(
      this.jobService.getAllJobs().subscribe(jobs => this.allJobs.set(jobs))
    );
    this.subs.add(
      this.authService.getAllUsers().subscribe(users => this.allUsers.set(users))
    );
  }

  openReviewDialog(job: JobApplication): void {
    const dialogRef = this.dialog.open(JobDialogComponent, {
      width: '600px',
      data: { job, isAdminReview: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updated: JobApplication = { ...job, ...result };
        this.jobService.updateJob(updated).subscribe(() => {
          this.snackBar.open('Mentor feedback saved!', 'Close', { duration: 2500 });
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}