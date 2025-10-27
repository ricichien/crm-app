import { Component, Inject, Optional, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import {
  Lead,
  LeadCreateDto,
  LeadSource,
  LeadStatus,
  LeadUpdateDto,
} from '../../../core/models/lead.model';
import { LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS } from '../../../core/models';
import { LeadService } from '../../../core/services/lead.service';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { finalize, Subject, takeUntil } from 'rxjs';

import { TaskFormComponent } from '@app/components/task-form/task-form.component';
import { TaskFormDialogComponent } from '@app/components/task-form-dialog/task-form-dialog.component';
import { LeadFormComponent } from '@app/pages/leads/lead-form/lead-form.component';
import { NavbarComponent } from '@app/components/navbar/navbar.component';

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
    MatIconModule,
    RouterModule,
    TaskFormComponent,
    TaskFormDialogComponent,
    LeadFormComponent,
    NavbarComponent,
  ],
  template: `
    <app-navbar></app-navbar>

    <div class="page-container">
      <div class="container-max lead-detail">
        <section class="card lead-form-card">
          <h3>{{ isEditMode ? 'Edit Lead' : 'New Lead' }}</h3>

          <!-- Edit mode: reuse the reusable app-lead-form component -->
          <app-lead-form
            *ngIf="isEditMode && lead"
            [lead]="lead"
            mode="edit"
            (saved)="onLeadSaved($event)"
          ></app-lead-form>

          <!-- Create mode: inline form -->
          <ng-container *ngIf="!isEditMode">
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="lead-form-inline">
              <div class="two-cols">
                <mat-form-field appearance="outline">
                  <mat-label>Primeiro nome</mat-label>
                  <input matInput formControlName="firstName" />
                  <mat-error *ngIf="form.get('firstName')?.hasError('required')"
                    >Primeiro nome é obrigatório</mat-error
                  >
                  <mat-error *ngIf="form.get('firstName')?.hasError('minlength')"
                    >Mínimo 3 caracteres</mat-error
                  >
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Sobrenome</mat-label>
                  <input matInput formControlName="lastName" />
                  <mat-error *ngIf="form.get('lastName')?.hasError('required')"
                    >Sobrenome é obrigatório</mat-error
                  >
                  <mat-error *ngIf="form.get('lastName')?.hasError('minlength')"
                    >Mínimo 2 caracteres</mat-error
                  >
                </mat-form-field>
              </div>

              <div>
                <mat-form-field appearance="outline" class="full">
                  <mat-label>E-mail</mat-label>
                  <input matInput formControlName="email" />
                  <mat-error *ngIf="form.get('email')?.hasError('required')"
                    >E-mail obrigatório</mat-error
                  >
                  <mat-error *ngIf="form.get('email')?.hasError('email')"
                    >E-mail inválido</mat-error
                  >
                </mat-form-field>
              </div>

              <div class="two-cols">
                <mat-form-field appearance="outline">
                  <mat-label>Telefone</mat-label>
                  <input matInput formControlName="phone" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Empresa</mat-label>
                  <input matInput formControlName="company" />
                </mat-form-field>
              </div>

              <div class="two-cols">
                <mat-form-field appearance="outline">
                  <mat-label>Cargo</mat-label>
                  <input matInput formControlName="jobTitle" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Origem</mat-label>
                  <mat-select formControlName="source">
                    <mat-option *ngFor="let s of leadSources" [value]="s.value">{{
                      s.label
                    }}</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="two-cols">
                <mat-form-field appearance="outline">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status">
                    <mat-option *ngFor="let s of leadStatuses" [value]="s.value">{{
                      s.label
                    }}</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Notas</mat-label>
                  <input matInput formControlName="notes" />
                </mat-form-field>
              </div>

              <div class="actions">
                <button mat-button type="button" (click)="close()" [disabled]="isSubmitting">
                  Cancelar
                </button>
                <button mat-flat-button color="primary" type="submit" [disabled]="isSubmitting">
                  <span *ngIf="!isSubmitting">Salvar</span>
                  <span *ngIf="isSubmitting">Salvando...</span>
                </button>
              </div>

              <div class="error" *ngIf="error">{{ error }}</div>
            </form>
          </ng-container>
        </section>

        <hr class="section-sep" />

        <section class="card lead-tasks">
          <div class="tasks-header">
            <h4>Tasks</h4>
            <button mat-flat-button color="primary" (click)="openAddTask()">+ Add Task</button>
          </div>

          <div *ngIf="tasksLoading" class="tasks-loading">
            <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
            <span>Loading tasks...</span>
          </div>

          <div *ngIf="!tasksLoading && tasks.length === 0" class="empty">
            No tasks for this lead.
          </div>

          <div *ngIf="!tasksLoading && tasks.length > 0" class="tasks-list">
            <div *ngFor="let t of tasks" class="task-row">
              <div class="task-main">
                <div class="task-info">
                  <div class="task-title">{{ t.title }}</div>
                  <div class="task-meta">
                    {{ t.dueDate | date : 'shortDate' }} • {{ t.priority }}
                  </div>
                </div>

                <div class="task-actions">
                  <button mat-icon-button color="primary" (click)="editTask(t)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteTask(t)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="showTaskForm" class="task-form-wrap">
            <app-task-form
              [task]="editingTask"
              [leadId]="leadId"
              (saved)="onTaskSaved($event)"
              (cancelled)="onTaskCancelled()"
            ></app-task-form>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* container card */
      .lead-detail {
        width: 100%;
      }

      .lead-form-card {
        background: var(--card-bg);
        border-radius: var(--radius);
        padding: 20px;
        box-shadow: var(--surface-shadow);
        border: 1px solid rgba(15, 23, 42, 0.04);
        margin-bottom: 18px;
      }

      h3 {
        margin: 0 0 12px 0;
        font-size: 1.125rem;
      }

      /* form layout */
      .lead-form-inline {
        display: block;
      }
      .two-cols {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 12px;
      }
      .full {
        width: 100%;
      }

      mat-form-field {
        width: 100%;
      }

      .actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 8px;
      }

      /* separator */
      .section-sep {
        border: none;
        height: 1px;
        background: transparent;
        margin: 18px 0;
      }

      /* tasks */
      .lead-tasks {
        margin-top: 8px;
        padding: 16px;
        border-radius: var(--radius);
        background: var(--card-bg);
        box-shadow: var(--surface-shadow);
        border: 1px solid rgba(15, 23, 42, 0.03);
      }

      .tasks-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .tasks-loading {
        display: flex;
        gap: 8px;
        align-items: center;
        color: var(--muted);
      }

      .empty {
        color: var(--muted);
        padding: 12px 0;
      }

      .tasks-list {
        display: grid;
        gap: 8px;
      }

      .task-row {
        background: #fbfdff;
        border-radius: 8px;
        padding: 12px;
        transition: transform 0.08s ease, box-shadow 0.08s ease;
        border: 1px solid rgba(15, 23, 42, 0.03);
      }
      .task-row:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
      }

      .task-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      .task-info {
        display: flex;
        flex-direction: column;
      }
      .task-title {
        font-weight: 600;
      }
      .task-meta {
        font-size: 12px;
        color: var(--muted);
        margin-top: 4px;
      }

      .task-actions button {
        opacity: 0.95;
      }

      .task-form-wrap {
        margin-top: 12px;
        background: var(--card-bg);
        padding: 14px;
        border-radius: 8px;
        border: 1px solid rgba(15, 23, 42, 0.03);
      }

      /* responsive */
      @media (max-width: 720px) {
        .two-cols {
          grid-template-columns: 1fr;
        }
      }

      /* dialog panel class (must be applied as panelClass when opening dialog) */
      .task-dialog-panel .mat-dialog-container {
        padding: 0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 16px 48px rgba(2, 6, 23, 0.5);
      }
      .task-dialog-panel .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        background: #fff;
      }
      .task-dialog-panel .dialog-close {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
      }
    `,
  ],
})
export class LeadDetailComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  leadSources = LEAD_SOURCE_OPTIONS;
  leadStatuses = LEAD_STATUS_OPTIONS;

  tasks: Task[] = [];
  tasksLoading = false;

  showTaskForm = false;
  editingTask?: Task | null;

  leadId?: string;
  lead?: Lead | null;

  error = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private taskService: TaskService,
    @Optional() private dialogRef?: MatDialogRef<LeadDetailComponent>,
    public dialog?: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { leadId?: string },
    private route?: ActivatedRoute,
    private router?: Router
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    const idFromDialog = this.data?.leadId;
    const idFromRoute = this.route?.snapshot.paramMap.get('id') ?? undefined;

    this.leadId = idFromDialog ?? idFromRoute;

    if (this.leadId && this.leadId !== 'new') {
      this.isEditMode = true;
      this.loadLead(this.leadId);
      this.loadTasks(this.leadId);
    } else {
      this.isEditMode = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else if (this.router) {
      this.router.navigate(['/leads']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const raw = this.form.value as any;
    const normalizeString = (v?: string | null): string | undefined => {
      if (v === undefined || v === null) return undefined;
      const s = String(v).trim();
      return s === '' ? undefined : s;
    };

    const createDto: LeadCreateDto = {
      firstName: normalizeString(raw.firstName) ?? '',
      lastName: normalizeString(raw.lastName) ?? '',
      email: normalizeString(raw.email) ?? '',
      phone: normalizeString(raw.phone),
      company: normalizeString(raw.company),
      jobTitle: normalizeString(raw.jobTitle),
      source: (normalizeString(raw.source) ?? 'Other') as LeadSource,
      status: (normalizeString(raw.status) ?? 'New') as LeadStatus,
      notes: normalizeString(raw.notes),
    };

    this.leadService
      .createLead(createDto)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: (lead: Lead) => {
          if (this.dialogRef) {
            this.dialogRef.close(lead);
          } else if (this.router) {
            this.router.navigate(['/leads', lead.id]);
          }
        },
        error: (err) => {
          console.error('[LeadDetail] createLead error', err);
          this.error = 'Erro ao criar lead.';
        },
      });
  }

  // ---------------- TASKS ----------------
  loadTasks(leadId: string) {
    this.tasksLoading = true;
    this.taskService
      .getByLead(leadId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.tasksLoading = false))
      )
      .subscribe({
        next: (res) => (this.tasks = res || []),
        error: (err) => {
          console.error('Error loading tasks', err);
          this.tasks = [];
        },
      });
  }

  openAddTask() {
    const id = this.leadId;

    if (!id) {
      this.editingTask = undefined;
      this.showTaskForm = true;
      return;
    }

    if (this.dialog) {
      const dialogRef = this.dialog.open(TaskFormDialogComponent, {
        width: '720px',
        data: { leadId: id, task: undefined },
        panelClass: 'task-dialog-panel',
        hasBackdrop: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result && id) {
          this.loadTasks(id);
        }
      });
    } else {
      this.editingTask = undefined;
      this.showTaskForm = true;
    }
  }

  editTask(t: Task) {
    const id = this.leadId;

    if (!id) {
      this.editingTask = t;
      this.showTaskForm = true;
      return;
    }

    if (this.dialog) {
      const dialogRef = this.dialog.open(TaskFormDialogComponent, {
        width: '720px',
        data: { leadId: id, task: t },
        panelClass: 'task-dialog-panel',
        hasBackdrop: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result && id) {
          this.loadTasks(id);
        }
      });
    } else {
      this.editingTask = t;
      this.showTaskForm = true;
    }
  }

  deleteTask(t: Task) {
    if (!t?.id) return;

    const confirmed = confirm(`Delete task "${t.title}"?`);
    if (!confirmed) return;

    this.taskService.deleteTask(t.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((task) => task.id !== t.id);
      },
      error: (err) => {
        console.error('Error deleting task', err);
        alert('Error deleting task.');
      },
    });
  }

  onTaskCancelled() {
    this.showTaskForm = false;
    this.editingTask = undefined;
  }

  onTaskSaved(task: Task | null) {
    this.showTaskForm = false;
    this.editingTask = undefined;
    if (task && this.leadId) {
      this.loadTasks(this.leadId);
    }
  }

  onLeadSaved(updated: any) {
    this.lead = updated as Lead;
    if (this.lead?.id) this.loadTasks(this.lead.id);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      jobTitle: [''],
      source: ['Other', Validators.required],
      status: ['New', Validators.required],
      notes: [''],
    });
  }

  private loadLead(id: string): void {
    this.isLoading = true;
    this.leadService
      .getLeadById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (lead: Lead) => {
          this.lead = lead;
          this.form.patchValue(lead as any);
        },
        error: (error: any) => {
          console.error('Error loading lead', error);
        },
      });
  }
}
