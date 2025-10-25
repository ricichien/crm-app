import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { TaskItem, TaskService } from '../../core/services/task.service';
import { TaskStatus, TaskPriority } from '../../core/models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskFormComponent],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css'],
})
export class TaskBoardComponent implements OnInit {
  tasksByStatus: { [key in TaskStatus]: TaskItem[] } = {
    [TaskStatus.Pending]: [],
    [TaskStatus.InProgress]: [],
    [TaskStatus.Completed]: [],
    [TaskStatus.Deferred]: [],
    [TaskStatus.Cancelled]: [],
  };

  statuses: TaskStatus[] = [TaskStatus.Pending, TaskStatus.InProgress, TaskStatus.Completed];

  loading = false;
  errorMsg = '';

  editingTask?: TaskItem;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks: TaskItem[]) => {
        for (const statusKey in this.tasksByStatus) {
          const st = statusKey as TaskItem['status'];
          this.tasksByStatus[st] = tasks
            .filter((t) => t.status === st)
            .sort((a, b) => a.order - b.order);
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

  drop(event: CdkDragDrop<TaskItem[]>, status: TaskItem['status']) {
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
    column.forEach((t, idx) => {
      t.order = idx;
      t.status = status;
      this.taskService.moveTask(t.id, t.status, t.order).subscribe({
        next: () => {},
        error: (err) => console.error('move error', err),
      });
    });
  }

  editTask(task: TaskItem) {
    this.editingTask = { ...task };
  }

  onTaskSaved(task: TaskItem) {
    this.editingTask = undefined;
    this.loadTasks();
  }

  createNewTask() {
    this.editingTask = undefined; // abrir form vazio
  }
}
