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
    TaskFormDialogComponent, // necessário para abrir via MatDialog
  ],
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.scss'],
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

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private taskService: TaskService,
    // torne o MatDialogRef e MAT_DIALOG_DATA opcionais
    @Optional() private dialogRef?: MatDialogRef<LeadDetailComponent>,
    public dialog?: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { leadId?: string },
    private route?: ActivatedRoute, // será undefined se o componente for instanciado pelo dialog (não necessariamente, mas marcado como injetável)
    private router?: Router
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    // obter leadId a partir do MAT_DIALOG_DATA (se presente) ou da rota
    console.log('[LeadDetail] ngOnInit()', {
      data: this.data,
      routeId: this.route?.snapshot.paramMap.get('id'),
    });
    const idFromDialog = this.data?.leadId;
    const idFromRoute = this.route?.snapshot.paramMap.get('id') ?? undefined;

    this.leadId = idFromDialog ?? idFromRoute;

    // se a rota for '/leads/new' então id === 'new' -> modo criação
    if (this.leadId && this.leadId !== 'new') {
      this.isEditMode = true;
      this.loadLead(this.leadId);
      this.loadTasks(this.leadId);
    } else {
      // criação: manter o formulário limpo, mas podemos preencher defaults
      this.isEditMode = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // fechar: se houver dialogRef -> fechar diálogo; senão navegar de volta para lista
  close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else if (this.router) {
      this.router.navigate(['/leads']);
    }
  }

  onSubmit(): void {
    console.log('[LeadDetail] onSubmit()', this.form.value);

    // Check form validity *after* logging, and report if invalid
    if (this.form.invalid) {
      console.warn('[LeadDetail] form invalid - controls:', this.form.controls);
      return;
    }

    this.isSubmitting = true;

    const raw = this.form.value as any;
    const normalizeString = (v?: string | null): string | undefined => {
      if (v === undefined || v === null) return undefined;
      const s = String(v).trim();
      return s === '' ? undefined : s;
    };

    // build DTO deterministically and log it
    const createDto: LeadCreateDto = {
      firstName: normalizeString(raw.firstName) ?? '',
      lastName: normalizeString(raw.lastName) ?? '',
      email: normalizeString(raw.email) ?? '',
      phone: normalizeString(raw.phone),
      company: normalizeString(raw.company),
      jobTitle: normalizeString(raw.jobTitle),
      // se raw.source não existe, já garante default explícito
      source: (normalizeString(raw.source) ?? 'Other') as LeadSource,
      status: (normalizeString(raw.status) ?? 'New') as LeadStatus,
      notes: normalizeString(raw.notes),
    };

    console.log('[LeadDetail] createDto ->', createDto);

    this.leadService
      .createLead(createDto)
      .pipe(
        finalize(() => (this.isSubmitting = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (lead: Lead) => {
          console.log('[LeadDetail] createLead next', lead);
          if (this.dialogRef) {
            this.dialogRef.close(lead);
          } else if (this.router) {
            this.router.navigate(['/leads', lead.id]);
          }
        },
        error: (err) => {
          console.error('[LeadDetail] createLead error', err);
          // mostrar um alerta simples para não ficar só no console
          alert('Error creating lead: ' + (err?.message ?? JSON.stringify(err)));
        },
      });
  }

  // ---------------- TASKS ----------------
  loadTasks(leadId: string) {
    this.tasksLoading = true;
    this.taskService
      .getByLead(leadId)
      .pipe(
        finalize(() => (this.tasksLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => (this.tasks = res),
        error: (err) => console.error('Error loading tasks', err),
      });
  }

  openAddTask() {
    const id = this.leadId;
    console.log('[LeadDetail] openAddTask', { id, hasDialog: !!this.dialog });

    // Se não tiver leadId (ex: estamos criando um novo lead), mostra form inline
    if (!id) {
      this.editingTask = undefined;
      this.showTaskForm = true;
      return;
    }

    // Se MatDialog estiver disponível, abra o diálogo; senão, use o form inline
    if (this.dialog) {
      const dialogRef = this.dialog.open(TaskFormDialogComponent, {
        width: '720px',
        data: { leadId: id, task: undefined }, // ou task: undefined
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
    console.log('[LeadDetail] editTask', { id, taskId: t?.id, hasDialog: !!this.dialog });

    if (!id) {
      // se não houver leadId, só exibe o form inline com a task para edição (offline until saved)
      this.editingTask = t;
      this.showTaskForm = true;
      return;
    }

    if (this.dialog) {
      const dialogRef = this.dialog.open(TaskFormDialogComponent, {
        width: '720px',
        data: { leadId: id, task: t }, // ou task: undefined
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
        // Remove imediatamente do array local
        this.tasks = this.tasks.filter((task) => task.id !== t.id);
        console.log(`[LeadDetail] Task ${t.id} deleted`);
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
    } else {
      // Se criou uma task enquanto o lead ainda não existia, mostramos um aviso no console
      console.log('[LeadDetail] task saved but no leadId to load tasks', {
        task,
        leadId: this.leadId,
      });
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
      notes: [''],
    });
  }

  private loadLead(id: string): void {
    this.isLoading = true;
    this.leadService
      .getLeadById(id)
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (lead: Lead) => {
          this.form.patchValue(lead);
        },
        error: (error: any) => {
          console.error('Error loading lead', error);
        },
      });
  }
}
