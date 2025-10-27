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

// <-- Ajuste este import para o path real do seu LeadFormComponent se necessário
import { LeadFormComponent } from '@app/pages/leads/lead-form/lead-form.component';

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
    LeadFormComponent, // necessário para reconhecer <app-lead-form>
  ],
  template: `
    <div class="lead-detail">
      <div class="lead-form">
        <h3>{{ isEditMode ? 'Edit Lead' : 'New Lead' }}</h3>

        <!-- Edit mode: reuse the reusable app-lead-form component -->
        <app-lead-form
          *ngIf="isEditMode && lead"
          [lead]="lead"
          mode="edit"
          (saved)="onLeadSaved($event)"
        ></app-lead-form>

        <!-- Create mode: inline form (quando não existe componente create separado) -->
        <ng-template #createBlock>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="lead-form-inline">
            <div class="row two-cols">
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

            <div class="row">
              <mat-form-field appearance="outline" class="full">
                <mat-label>E-mail</mat-label>
                <input matInput formControlName="email" />
                <mat-error *ngIf="form.get('email')?.hasError('required')"
                  >E-mail obrigatório</mat-error
                >
                <mat-error *ngIf="form.get('email')?.hasError('email')">E-mail inválido</mat-error>
              </mat-form-field>
            </div>

            <div class="row two-cols">
              <mat-form-field appearance="outline">
                <mat-label>Telefone</mat-label>
                <input matInput formControlName="phone" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Empresa</mat-label>
                <input matInput formControlName="company" />
              </mat-form-field>
            </div>

            <div class="row two-cols">
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

            <div class="row two-cols">
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
        </ng-template>

        <!-- render createBlock when not edit mode -->
        <ng-container *ngIf="!isEditMode">
          <ng-container *ngTemplateOutlet="createBlock"></ng-container>
        </ng-container>
      </div>

      <hr />

      <div class="lead-tasks">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <h4>Tasks</h4>
          <button mat-flat-button color="primary" (click)="openAddTask()">+ Add Task</button>
        </div>

        <div *ngIf="tasksLoading">Loading tasks...</div>

        <div *ngIf="!tasksLoading && tasks.length === 0" class="empty">No tasks for this lead.</div>

        <div *ngIf="!tasksLoading && tasks.length > 0" class="tasks-list">
          <div
            *ngFor="let t of tasks"
            class="task-row"
            style="padding: 8px; border-bottom: 1px solid #eee"
          >
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div>
                <div style="font-weight: 600">{{ t.title }}</div>
                <div style="font-size: 12px; color: #666">
                  {{ t.dueDate | date : 'shortDate' }} • {{ t.priority }}
                </div>
              </div>
              <div>
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

        <div
          *ngIf="showTaskForm"
          style="margin-top: 12px; background: #fff; padding: 12px; border-radius: 8px"
        >
          <app-task-form
            [task]="editingTask"
            [leadId]="leadId"
            (saved)="onTaskSaved($event)"
            (cancelled)="onTaskCancelled()"
          ></app-task-form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .lead-detail {
        max-width: 920px;
        margin: 0 auto;
      }
      .lead-form {
        padding: 12px;
        background: #f7f9fc;
        border-radius: 8px;
      }
      .lead-form-inline .row {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }
      .two-cols mat-form-field {
        flex: 1;
      }
      .full {
        width: 100%;
      }
      .actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 12px;
      }
      .lead-tasks {
        margin-top: 16px;
      }
      .tasks-list .task-row {
        background: #fff;
        border-radius: 6px;
        margin-bottom: 6px;
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

    // CORREÇÃO: takeUntil + finalize como operadores separados
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

  // Aceita any aqui pra evitar erro de template binding; ideal seria que app-lead-form emitisse Lead explicitamente.
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
