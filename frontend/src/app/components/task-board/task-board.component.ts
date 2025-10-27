import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../core/models/task.model';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    NavbarComponent,
    TaskFormDialogComponent,
  ],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss'],
})
export class TaskBoardComponent implements OnInit {
  tasksByStatus: Record<string, Task[]> = {
    [TaskStatus.Pending]: [],
    [TaskStatus.InProgress]: [],
    [TaskStatus.Completed]: [],
    [TaskStatus.Deferred]: [],
    [TaskStatus.Cancelled]: [],
  };

  statuses: TaskStatus[] = [
    TaskStatus.Pending,
    TaskStatus.InProgress,
    TaskStatus.Completed,
    TaskStatus.Deferred,
    TaskStatus.Cancelled,
  ];

  dropListIds: string[] = [];

  loading = false;
  errorMsg = '';
  private _isDragging = false;

  constructor(private taskService: TaskService, private dialog: MatDialog, private router: Router) {
    this.dropListIds = this.statuses.map((s) => String(s));
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  toKey(status: TaskStatus): string {
    return String(status);
  }

  connectedTo(status: TaskStatus): string[] {
    const id = String(status);
    return this.dropListIds.filter((x) => x !== id);
  }

  loadTasks(): void {
    this.loading = true;
    this.errorMsg = '';
    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        console.log('tasks from API:', tasks);
        for (const s of this.statuses) {
          this.tasksByStatus[String(s)] = [];
        }

        for (const t of tasks) {
          const st = String(t.status ?? TaskStatus.Pending);
          if (!this.tasksByStatus[st]) this.tasksByStatus[st] = [];
          this.tasksByStatus[st].push(t);
        }

        for (const s of this.statuses) {
          const key = String(s);
          this.tasksByStatus[key].sort(
            (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
          );
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.errorMsg = 'Failed to load tasks';
        this.loading = false;
      },
    });
  }

  drop(event: CdkDragDrop<Task[]>, status: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const column = event.container.data;
    column.forEach((t: Task, idx: number) => {
      t.order = idx;
      t.status = status as any;
      // call service but don't block UI
      this.taskService.moveTask(t.id, t.status, t.order ?? 0).subscribe({
        next: () => {},
        error: (err) => console.error('move error', err),
      });
    });
  }

  onDragStarted(): void {
    this._isDragging = true;
  }

  onDragEnded(): void {
    setTimeout(() => (this._isDragging = false), 50);
  }

  get isDragging(): boolean {
    return this._isDragging;
  }

  onCardClick(task: Task): void {
    if (this.isDragging) return;
    this.openEditDialog(task);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(TaskFormDialogComponent, {
      width: '100%',
      maxWidth: '720px',
      maxHeight: '90vh',
      data: { leadId: undefined, task: undefined },
      panelClass: 'task-dialog-panel',
      hasBackdrop: true,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.loadTasks();
    });
  }

  openEditDialog(task: Task): void {
    const ref = this.dialog.open(TaskFormDialogComponent, {
      width: '720px',
      data: { leadId: task.leadId, task },
      panelClass: 'task-dialog-panel',
      hasBackdrop: true,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.loadTasks();
    });
  }

  avatarInitials(name?: string | null): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    const first = parts[0].substring(0, 1).toUpperCase();
    const last = parts[parts.length - 1].substring(0, 1).toUpperCase();
    return `${first}${last}`;
  }

  getLeadName(task: Task): string {
    if (!task) return 'Unknown';
    if (task.leadName && String(task.leadName).trim()) return String(task.leadName).trim();

    const lead = task.lead as any;
    if (lead) {
      const fn = lead.firstName ?? lead.name ?? '';
      const ln = lead.lastName ?? '';
      const full = `${fn} ${ln}`.trim();
      if (full) return full;
    }

    const contact = (task as any).contactName ?? (task as any).customerName ?? '';
    if (contact) return contact;

    return 'Unknown';
  }

  getPriorityLabel(task: Task): string {
    if (!task) return '';
    if (task.priority) return String(task.priority);
    if (task.isUrgent) return 'Urgent';
    return '';
  }

  getPriorityClass(task: Task): string {
    if (!task) return 'priority-low';
    switch (task.priority) {
      case TaskPriority.Urgent:
        return 'priority-urgent';
      case TaskPriority.High:
        return 'priority-high';
      case TaskPriority.Medium:
        return 'priority-medium';
      case TaskPriority.Low:
        return 'priority-low';
      default:
        // fallback to isUrgent flag
        return task.isUrgent ? 'priority-urgent' : 'priority-low';
    }
  }

  getDotClass(task: Task): string {
    const base = this.getPriorityClass(task).replace('priority-', '');
    return `dot-${base}`;
  }
}
