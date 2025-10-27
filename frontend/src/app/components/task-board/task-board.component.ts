import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../core/models/task.model';
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
  ],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss'], // estou usando scss como pediu
})
export class TaskBoardComponent implements OnInit {
  // agora um mapa indexado por string para evitar erros de template-checking
  tasksByStatus: Record<string, Task[]> = {
    [TaskStatus.Pending]: [],
    [TaskStatus.InProgress]: [],
    [TaskStatus.Completed]: [],
    [TaskStatus.Deferred]: [],
    [TaskStatus.Cancelled]: [],
  };

  // continua sendo um array de enums (ordem das colunas)
  statuses: TaskStatus[] = [
    TaskStatus.Pending,
    TaskStatus.InProgress,
    TaskStatus.Completed,
    TaskStatus.Deferred,
    TaskStatus.Cancelled,
  ];

  // lista de ids (strings) usada pelos drop lists — garante consistência
  dropListIds: string[] = [];

  loading = false;
  errorMsg = '';

  // flag para distinguir drag de click
  private _isDragging = false;
  public get isDragging(): boolean {
    return this._isDragging;
  }

  constructor(private taskService: TaskService, private dialog: MatDialog, private router: Router) {
    // build dropListIds a partir dos statuses (string)
    this.dropListIds = this.statuses.map((s) => String(s));
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  toKey(status: TaskStatus): string {
    return String(status);
  }

  // retorna ids conectados para uma lista (todos exceto self)
  connectedTo(status: TaskStatus): string[] {
    const id = String(status);
    return this.dropListIds.filter((x) => x !== id);
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        // clear buckets
        for (const s of this.statuses) {
          this.tasksByStatus[String(s)] = [];
        }

        for (const t of tasks) {
          const st = String(t.status ?? TaskStatus.Pending);
          if (!this.tasksByStatus[st]) this.tasksByStatus[st] = [];
          this.tasksByStatus[st].push(t);
        }

        // sort: undefined order -> goes to end
        for (const s of this.statuses) {
          const key = String(s);
          this.tasksByStatus[key].sort(
            (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
          );
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
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

    // update orders locally and send to backend
    const column = event.container.data;
    column.forEach((t: Task, idx: number) => {
      t.order = idx;
      t.status = status as any;
      // call API to persist each moved item (use 0 as fallback)
      this.taskService.moveTask(t.id, t.status, t.order ?? 0).subscribe({
        next: () => {},
        error: (err) => {
          console.error('move error', err);
          // optional: reload to revert if necessary
          // this.loadTasks();
        },
      });
    });
  }

  // ---- drag / click helpers ----
  onDragStarted(): void {
    this._isDragging = true;
  }

  onDragEnded(): void {
    // short timeout to avoid click immediately after drag triggering open
    setTimeout(() => (this._isDragging = false), 50);
  }

  // card click: ignore if we were dragging
  onCardClick(task: Task): void {
    if (this.isDragging) return;
    this.openEditDialog(task);
  }

  // ---- dialogs ----
  openCreateDialog(): void {
    const ref = this.dialog.open(TaskFormDialogComponent, {
      width: '720px',
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
}
