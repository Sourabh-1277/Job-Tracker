import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ApplicationStatus, JobApplication } from '../../../core/model/job.model';

export interface JobDialogData {
  job?: JobApplication;
  isAdminReview?: boolean;
}

@Component({
  selector: 'app-job-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './job-dialog.component.html'
})
export class JobDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<JobDialogComponent>);

  jobForm!: FormGroup;
  statuses: ApplicationStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected'];
  isEditMode = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: JobDialogData) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.job;
    const job = this.data?.job;

    this.jobForm = this.fb.group({
      company: [job?.company || '', [Validators.required, Validators.minLength(2)]],
      position: [job?.position || '', [Validators.required]],
      location: [job?.location || '', [Validators.required]],
      ctcOrSalary: [job?.ctcOrSalary || '', [Validators.required]],
      status: [job?.status || 'Applied', [Validators.required]],
      appliedDate: [job?.appliedDate || new Date().toISOString().split('T')[0], [Validators.required]],
      jobUrl: [job?.jobUrl || ''],
      notes: [job?.notes || ''],
      mentorFeedback: [job?.mentorFeedback || '']
    });
  }

  onSave(): void {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.jobForm.value);
  }
}