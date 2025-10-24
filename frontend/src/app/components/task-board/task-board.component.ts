import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskItem, TaskService } from '../../core/services/task.service';
import { TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css']
})
export class TaskBoardComponent implements OnInit {
  tasksByStatus: { [key in TaskStatus]: TaskItem[] } = {
    [TaskStatus.Pending]: [],
    [TaskStatus.InProgress]: [],
    [TaskStatus.Completed]: [],
    [TaskStatus.Deferred]: [],
    [TaskStatus.Cancelled]: []
  };

  statuses: TaskStatus[] = [
    TaskStatus.Pending,
    TaskStatus.InProgress,
    TaskStatus.Completed
  ];

  loading = false;
  errorMsg = '';

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks: any[]) => {
        for (const statusKey in this.tasksByStatus) {
          const st = statusKey as TaskItem['status'];
          this.tasksByStatus[st] = tasks
            .filter((t: { status: any; }) => t.status === st)
            .sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMsg = 'Failed to load tasks';
        this.loading = false;
      }
    });
  }

  drop(event: CdkDragDrop<TaskItem[]>, status: TaskItem['status']) {
    // local reorder or transfer between columns
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

    // update order for all items in that column (simple approach)
    const column = event.container.data;
    column.forEach((t, idx) => {
      t.order = idx;
      t.status = status;
      // optimistic update: call moveTask for each changed item, but you can batch it later
      this.taskService.moveTask(t.id, t.status, t.order).subscribe({
        next: () => {},
        error: (err: any) => console.error('move error', err)
      });
    });
  }
}
