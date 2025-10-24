import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Lead, LeadCreateDto, LeadUpdateDto, LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS } from '@app/core/models';
import { LeadService } from '@app/core/services';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.scss']
})
export class LeadDetailComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  leadSources = LEAD_SOURCE_OPTIONS;
  leadStatuses = LEAD_STATUS_OPTIONS;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private dialogRef: MatDialogRef<LeadDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { leadId?: string }
  ) {
    this.form = this.createForm();
    this.isEditMode = !!data?.leadId;
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.leadId) {
      this.loadLead(this.data.leadId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;

    const request$ = this.isEditMode && this.data.leadId
      ? this.leadService.updateLead(this.data.leadId, formValue)
      : this.leadService.createLead(formValue);

    request$
      .pipe(
        finalize(() => this.isSubmitting = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (lead) => {
          this.dialogRef.close(lead);
        },
        error: (error) => {
          console.error('Error saving lead', error);
          // Handle error (show toast, etc.)
        }
      });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      phone: ['', [Validators.maxLength(50)]],
      company: ['', [Validators.maxLength(200)]],
      jobTitle: ['', [Validators.maxLength(200)]],
      source: ['', Validators.required],
      status: ['', Validators.required],
      notes: ['']
    });
  }

  private loadLead(id: string): void {
    this.isLoading = true;
    this.leadService.getLeadById(id)
      .pipe(
        finalize(() => this.isLoading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (lead) => {
          this.form.patchValue(lead);
        },
        error: (error) => {
          console.error('Error loading lead', error);
          // Handle error (show toast, etc.)
        }
      });
  }
}