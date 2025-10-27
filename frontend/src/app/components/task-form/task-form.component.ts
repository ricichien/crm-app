import {
  Component,
  EventEmitter,
  Input,
  Optional,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TaskService } from '../../core/services/task.service';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskCreateDto,
  TaskUpdateDto,
} from '../../core/models/task.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnChanges {
  @Input() task?: Task | null;
  @Input() leadId?: string;

  @Input() hideActions = false;

  @Output() saved = new EventEmitter<Task | null>();
  @Output() cancelled = new EventEmitter<void>();

  form!: ReturnType<FormBuilder['group']>;
  loading = false;
  serverError = '';

  statuses: TaskStatus[] = Object.values(TaskStatus) as TaskStatus[];
  priorities: TaskPriority[] = Object.values(TaskPriority) as TaskPriority[];

  constructor(private fb: FormBuilder, @Optional() private taskService?: TaskService) {
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dueDate: [null as Date | null],
      priority: [TaskPriority.Medium],
      status: [TaskStatus.Pending, Validators.required],
      order: [0],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['task'] && this.form) {
      if (this.task) {
        this.form.patchValue({
          title: this.task.title ?? '',
          description: this.task.description ?? '',
          dueDate: this.task.dueDate ? new Date(this.task.dueDate) : null,
          priority: this.task.priority ?? TaskPriority.Medium,
          status: this.task.status ?? TaskStatus.Pending,
          order: this.task.order ?? 0,
        });
        this.leadId = this.task.leadId ?? this.leadId;
      } else {
        this.form.reset({
          title: '',
          description: '',
          dueDate: null,
          priority: TaskPriority.Medium,
          status: TaskStatus.Pending,
          order: 0,
        });
      }
    }
  }

  get titleControl(): FormControl<string | null> {
    return this.form.get('title') as FormControl<string | null>;
  }

  public save() {
    this.serverError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    const title = this.titleControl.value?.trim() ?? '';

    const dueDateVal = this.form.value.dueDate;
    let dueDateIso: string | null = null;
    if (dueDateVal) {
      const parsed = dueDateVal instanceof Date ? dueDateVal : new Date(dueDateVal);
      if (!isNaN(parsed.getTime())) {
        dueDateIso = parsed.toISOString();
      } else {
        dueDateIso = null;
      }
    }

    const dtoCreate: TaskCreateDto = {
      title,
      description: this.form.value.description ?? '',
      dueDate: dueDateIso,
      priority: this.form.value.priority as TaskPriority,
      status: this.form.value.status as TaskStatus,
      leadId: this.leadId ?? undefined,
      order: this.form.value.order ?? 0,
    };

    const dtoUpdate: TaskUpdateDto = {
      title,
      description: this.form.value.description ?? '',
      dueDate: dueDateIso,
      priority: this.form.value.priority as TaskPriority,
      status: this.form.value.status as TaskStatus,
      leadId: this.leadId ?? undefined,
      order: this.form.value.order ?? 0,
    };

    if (this.taskService && this.task && this.task.id) {
      this.taskService
        .updateTask(this.task.id, dtoUpdate)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            this.saved.emit(res);
          },
          error: (err) => {
            console.error(err);
            if (err?.status === 400 && err?.error?.errors) {
              const msgs: string[] = [];
              Object.keys(err.error.errors).forEach((k) => msgs.push(...err.error.errors[k]));
              this.serverError = msgs.join('; ');
            } else {
              this.serverError = err?.error?.message ?? err?.message ?? 'Failed to update task';
            }
          },
        });

      return;
    }

    if (this.taskService) {
      const obs = this.leadId
        ? this.taskService.createTaskForLead(this.leadId, dtoCreate)
        : this.taskService.createTask(dtoCreate);

      obs.pipe(finalize(() => (this.loading = false))).subscribe({
        next: (res) => {
          this.saved.emit(res);
        },
        error: (err) => {
          console.error(err);
          if (err?.status === 400 && err?.error?.errors) {
            const msgs: string[] = [];
            Object.keys(err.error.errors).forEach((k) => msgs.push(...err.error.errors[k]));
            this.serverError = msgs.join('; ');
          } else {
            this.serverError = err?.error?.message ?? err?.message ?? 'Failed to create task';
          }
        },
      });

      return;
    }

    const now = new Date().toISOString();
    const fake: Task = {
      id: Date.now().toString(),
      title: dtoCreate.title,
      description: dtoCreate.description,
      dueDate: dtoCreate.dueDate,
      priority: dtoCreate.priority,
      status: dtoCreate.status ?? TaskStatus.Pending,
      leadId: dtoCreate.leadId,
      order: dtoCreate.order,
      createdAt: now,
      lastModifiedAt: now,
    };

    this.loading = false;
    this.saved.emit(fake);
  }

  public cancel() {
    this.cancelled.emit();
  }
}
