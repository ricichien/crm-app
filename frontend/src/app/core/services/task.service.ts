import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskPriority, TaskStatus } from '../models/task.model';

export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  order: number;
  leadId?: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:5256/api/tasks'; // ajuste a porta do backend

  constructor(private http: HttpClient) {}

  getTasks(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(this.apiUrl);
  }

  createTask(task: Partial<TaskItem>): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, task);
  }

  updateTask(task: TaskItem): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${this.apiUrl}/${task.id}`, task);
  }

  moveTask(taskId: number, newStatus: TaskStatus, newOrder: number): Observable<TaskItem> {
    return this.http.post<TaskItem>(`${this.apiUrl}/move`, { taskId, newStatus, newOrder });
  }

  // array de status para uso em componentes
  getStatuses(): TaskStatus[] {
    return [TaskStatus.Pending, TaskStatus.InProgress, TaskStatus.Completed];
  }
}
