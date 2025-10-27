import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TaskFormComponent } from '../task-form/task-form.component';
import { Task } from '../../core/models/task.model';

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
        <div class="title">
          <h2>{{ data.task ? 'Edit Task' : 'New Task' }}</h2>
          <p class="subtitle" *ngIf="data.leadId">Lead: {{ data.leadId }}</p>
        </div>
        <button mat-icon-button aria-label="Close" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <mat-dialog-content>
        <app-task-form
          #taskForm
          [task]="data.task"
          [leadId]="data.leadId"
          (saved)="onSaved($event)"
          (cancelled)="onCancelled()"
        ></app-task-form>
      </mat-dialog-content>

      <mat-divider></mat-divider>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-stroked-button (click)="onCancelClick()" type="button">Cancel</button>
        <button mat-flat-button color="primary" (click)="onSaveClick()" type="button">Save</button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./task-form-dialog.component.scss'],
})
export class TaskFormDialogComponent {
  @ViewChild('taskForm') taskForm?: TaskFormComponent;

  constructor(
    private dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { leadId?: string; task?: Task }
  ) {}

  onSaved(result: Task | null) {
    this.dialogRef.close(result);
  }

  onCancelled() {
    this.dialogRef.close(null);
  }

  close() {
    this.dialogRef.close(null);
  }

  /** ⬇️ CHAMA O MÉTODO CORRETO */
  onSaveClick(): void {
    this.taskForm?.save();
  }

  onCancelClick(): void {
    this.taskForm?.cancel();
    this.dialogRef.close(null);
  }
}
