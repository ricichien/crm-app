import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TaskFormComponent } from '../task-form/task-form.component';
import { Task } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    TaskFormComponent,
  ],
  template: `
    <div class="dialog-root">
      <div class="dialog-header">
        <div class="header-left">
          <div class="title">
            <h2>{{ data.task ? 'Edit Task' : 'New Task' }}</h2>
          </div>
        </div>

        <div class="header-actions">
          <!-- show delete button only when editing an existing task -->
          <button
            *ngIf="data.task?.id"
            mat-icon-button
            aria-label="Delete task"
            (click)="onDeleteClick()"
            class="delete-btn"
            title="Delete task"
          >
            <mat-icon>delete</mat-icon>
          </button>

          <button mat-icon-button class="close-btn" aria-label="Close" (click)="onCancelClick()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <mat-divider></mat-divider>

      <mat-dialog-content>
        <app-task-form
          #taskForm
          [task]="data.task"
          [leadId]="data.leadId"
          [hideActions]="true"
          (saved)="onSaved($event)"
          (cancelled)="onCancelled()"
        ></app-task-form>
      </mat-dialog-content>

      <mat-divider></mat-divider>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-stroked-button type="button" (click)="onCancelClick()">Cancel</button>
        <button mat-flat-button color="primary" (click)="onSaveClick()" cdkFocusInitial>
          Save
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .dialog-root {
        width: 100%;
        max-width: 720px;
        display: flex;
        flex-direction: column;
        margin: 0 auto;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        gap: 12px;
        border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        position: relative;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .title h2 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
      }

      mat-dialog-content {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 16px 24px;
        box-sizing: border-box;
      }

      app-task-form {
        width: 100%;
        max-width: 520px;
        margin: 0 auto;
      }

      .dialog-actions {
        padding: 12px 16px;
        border-top: 1px solid rgba(15, 23, 42, 0.06);
      }

      .delete-btn {
        color: rgba(220, 38, 38, 0.85);
        transition: color 0.2s ease;
      }

      .delete-btn:hover {
        color: #dc2626;
      }

      .close-btn {
        color: #444;
      }

      .close-btn:hover {
        color: #000;
      }
    `,
  ],
})
export class TaskFormDialogComponent {
  @ViewChild('taskForm') taskForm?: TaskFormComponent;

  isDeleting = false;

  constructor(
    private dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { leadId?: string; task?: Task },
    private taskService: TaskService
  ) {}

  onSaved(result: Task | null) {
    this.dialogRef.close(result);
  }

  onCancelled() {
    this.dialogRef.close(null);
  }

  onSaveClick(): void {
    this.taskForm?.save();
  }

  onCancelClick(): void {
    this.taskForm?.cancel();
    this.dialogRef.close(null);
  }

  onDeleteClick(): void {
    const t = this.data.task;
    if (!t?.id) return;

    const confirmed = confirm(`Delete task "${t.title}"?`);
    if (!confirmed) return;

    this.isDeleting = true;
    this.taskService
      .deleteTask(t.id)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: () => {
          this.dialogRef.close({ deleted: true, id: t.id });
        },
        error: (err) => {
          console.error('Error deleting task from dialog', err);
          alert('Erro ao deletar a task.');
        },
      });
  }
}
