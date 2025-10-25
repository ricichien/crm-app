import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskItem, TaskService } from '../../core/services/task.service';
import { TaskPriority, TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent {
  @Input() task: Partial<TaskItem> = {}; // vazio para "new", preenchido para "edit"
  @Output() saved = new EventEmitter<TaskItem>();
  @Output() cancelled = new EventEmitter<void>();

  priorities = Object.values(TaskPriority);
  statuses = Object.values(TaskStatus);

  constructor(private taskService: TaskService) {}

  save() {
    if (this.task.id) {
      // update
      this.taskService.updateTask(this.task as TaskItem).subscribe((task) => this.saved.emit(task));
    } else {
      // create
      this.taskService.createTask(this.task).subscribe((task) => this.saved.emit(task));
    }
  }

  cancel() {
    this.cancelled.emit();
  }
}
