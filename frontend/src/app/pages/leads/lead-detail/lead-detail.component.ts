// src/app/pages/leads/lead-detail/lead-detail.component.ts
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Lead, LeadCreateDto, LeadUpdateDto } from '../../../core/models/lead.model';
import { LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS } from '../../../core/models';
import { LeadService } from '../../../core/services/lead.service';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
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
  const raw = this.form.value;

  if (this.isEditMode && this.data.leadId) {
    const updateDto: LeadUpdateDto = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone,
      company: raw.company,
      jobTitle: raw.jobTitle,
      source: raw.source,
      status: raw.status,
      notes: raw.notes
    };

    this.leadService.updateLead(this.data.leadId, updateDto)
      .pipe(finalize(() => this.isSubmitting = false), takeUntil(this.destroy$))
      .subscribe({ next: (lead: Lead) => this.dialogRef.close(lead), error: (err: any) => { console.error(err); } });
  } else {
    const createDto: LeadCreateDto = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone,
      company: raw.company,
      jobTitle: raw.jobTitle,
      source: raw.source,
      status: raw.status,
      notes: raw.notes
    };

    this.leadService.createLead(createDto)
      .pipe(finalize(() => this.isSubmitting = false), takeUntil(this.destroy$))
      .subscribe({ next: (lead: Lead) => this.dialogRef.close(lead), error: (err: any) => { console.error(err); } });
  }
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
        next: (lead: Lead) => {
          this.form.patchValue(lead);
        },
        error: (error: any) => {
          console.error('Error loading lead', error);
        }
      });
  }
}

// import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { Lead, LeadCreateDto, LeadUpdateDto, LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS } from '../../../core/models';
// import { LeadService } from '../../../core/services/lead.service';
// import { finalize, Subject, takeUntil } from 'rxjs';
// import { CommonModule } from '@angular/common';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatIconModule } from '@angular/material/icon';
// import { MatInputModule } from '@angular/material/input';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSelectModule } from '@angular/material/select';

// @Component({
//   selector: 'app-lead-detail',
//   templateUrl: './lead-detail.component.html',
//   styleUrls: ['./lead-detail.component.scss']
// })
// export class LeadDetailComponent implements OnInit, OnDestroy {
//   form: FormGroup;
//   isEditMode = false;
//   isLoading = false;
//   isSubmitting = false;
//   leadSources = LEAD_SOURCE_OPTIONS;
//   leadStatuses = LEAD_STATUS_OPTIONS;

//   private destroy$ = new Subject<void>();

//   constructor(
//     private fb: FormBuilder,
//     private leadService: LeadService,
//     private dialogRef: MatDialogRef<LeadDetailComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: { leadId?: string }
//   ) {
//     this.form = this.createForm();
//     this.isEditMode = !!data?.leadId;
//   }

//   ngOnInit(): void {
//     if (this.isEditMode && this.data.leadId) {
//       this.loadLead(this.data.leadId);
//     }
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   onSubmit(): void {
//     if (this.form.invalid) {
//       return;
//     }

//     this.isSubmitting = true;
//     const formValue = this.form.value;

//     const request$ = this.isEditMode && this.data.leadId
//       ? this.leadService.updateLead(this.data.leadId, formValue)
//       : this.leadService.createLead(formValue);

//     request$
//       .pipe(
//         finalize(() => this.isSubmitting = false),
//         takeUntil(this.destroy$)
//       )
//       .subscribe({
//         next: (lead) => {
//           this.dialogRef.close(lead);
//         },
//         error: (error) => {
//           console.error('Error saving lead', error);
//           // Handle error (show toast, etc.)
//         }
//       });
//   }

//   private createForm(): FormGroup {
//     return this.fb.group({
//       firstName: ['', [Validators.required, Validators.maxLength(100)]],
//       lastName: ['', [Validators.required, Validators.maxLength(100)]],
//       email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
//       phone: ['', [Validators.maxLength(50)]],
//       company: ['', [Validators.maxLength(200)]],
//       jobTitle: ['', [Validators.maxLength(200)]],
//       source: ['', Validators.required],
//       status: ['', Validators.required],
//       notes: ['']
//     });
//   }

//   private loadLead(id: string): void {
//     this.isLoading = true;
//     this.leadService.getLeadById(id)
//       .pipe(
//         finalize(() => this.isLoading = false),
//         takeUntil(this.destroy$)
//       )
//       .subscribe({
//         next: (lead) => {
//           this.form.patchValue(lead);
//         },
//         error: (error) => {
//           console.error('Error loading lead', error);
//           // Handle error (show toast, etc.)
//         }
//       });
//   }
// }