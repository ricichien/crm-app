import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, map, catchError } from 'rxjs';
import { Task, TaskCreateDto, TaskUpdateDto, TaskStatus, TaskPriority } from '../models/task.model';
import { environment } from '@env/environment';

const STATUS_TO_NUMBER: Record<TaskStatus, number> = {
  [TaskStatus.Pending]: 0,
  [TaskStatus.InProgress]: 1,
  [TaskStatus.Completed]: 2,
  [TaskStatus.Deferred]: 3,
  [TaskStatus.Cancelled]: 4,
};

const NUMBER_TO_STATUS: Record<number, TaskStatus> = Object.entries(STATUS_TO_NUMBER).reduce(
  (acc, [k, v]) => {
    acc[v] = k as TaskStatus;
    return acc;
  },
  {} as Record<number, TaskStatus>
);

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:5256/api/TaskItems';
  private leadsTasksBase = `${environment.apiUrl}/api/leads`;

  constructor(private http: HttpClient) {}

  private mapFromBackend(raw: any): Task {
    const statusRaw = raw.status;
    const status =
      typeof statusRaw === 'number'
        ? NUMBER_TO_STATUS[statusRaw] ?? TaskStatus.Pending
        : (statusRaw as TaskStatus);

    return {
      id: String(raw.id),
      title: raw.title,
      description: raw.description ?? '',
      dueDate: raw.dueDate ?? null,
      priority: raw.priority ?? TaskPriority.Medium,
      status,
      leadId: raw.leadId ? String(raw.leadId) : undefined,
      order: raw.order ?? 0,
      createdAt: raw.createdAt ?? new Date().toISOString(),
      lastModifiedAt: raw.lastModifiedAt ?? raw.updatedAt ?? new Date().toISOString(),

      lead: raw.lead ?? undefined,
      leadName:
        raw.leadName ??
        (raw.lead ? `${raw.lead.firstName ?? ''} ${raw.lead.lastName ?? ''}`.trim() : undefined),
      leadAvatarUrl: raw.leadAvatarUrl ?? (raw.lead ? raw.lead.avatarUrl : undefined),
    } as Task;
  }

  private mapToBackendCreate(dto: TaskCreateDto) {
    return {
      ...dto,
      status:
        dto.status !== undefined && dto.status !== null
          ? STATUS_TO_NUMBER[dto.status as TaskStatus]
          : undefined,
      dueDate: dto.dueDate === null ? null : dto.dueDate, // mantém null explicitamente
      leadId: dto.leadId ?? null,
    };
  }

  private mapToBackendUpdate(dto: TaskUpdateDto) {
    const out: any = { ...dto };
    if (dto.status !== undefined && dto.status !== null) {
      out.status = STATUS_TO_NUMBER[dto.status as TaskStatus];
    }
    // se for undefined, mantemos omisso; se foi enviado explicitamente null, mantemos null
    if (dto.leadId === undefined) out.leadId = null;
    if (dto.dueDate === undefined) delete out.dueDate; // não enviar campo se não informado
    return out;
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((res) => (res ?? []).map((r) => this.mapFromBackend(r))),
      catchError((err) => {
        console.error('getTasks error', err);
        return throwError(() => err?.error ?? err);
      })
    );
  }

  getById(id: string): Observable<Task> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((r) => this.mapFromBackend(r)),
      catchError((err) => {
        console.error('getById error', err);
        return throwError(() => err?.error ?? err);
      })
    );
  }

  createTask(dto: TaskCreateDto): Observable<Task> {
    const payload = this.mapToBackendCreate(dto);
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map((r) => this.mapFromBackend(r)),
      catchError((err) => {
        console.error('createTask error', err);
        return throwError(() => err?.error ?? err);
      })
    );
  }

  updateTask(id: string, dto: TaskUpdateDto): Observable<Task> {
    const payload = this.mapToBackendUpdate(dto);
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map((r) => this.mapFromBackend(r)),
      catchError((err) => {
        console.error('updateTask error', err);
        return throwError(() => err?.error ?? err);
      })
    );
  }

  moveTask(taskId: string, newStatus: TaskStatus, newOrder: number) {
    const body = {
      TaskId: Number(taskId),
      NewStatus: STATUS_TO_NUMBER[newStatus],
      NewOrder: newOrder,
    };
    return this.http.post<any>(`${this.apiUrl}/move`, body).pipe(
      map((r) => this.mapFromBackend(r)),
      catchError((err) => {
        console.error('moveTask error', err);
        return throwError(() => err?.error ?? err);
      })
    );
  }

  deleteTask(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('deleteTask error', err);
        return throwError(() => err?.error ?? err);
      })
    );
  }

  getStatuses(): TaskStatus[] {
    return Object.values(TaskStatus) as TaskStatus[];
  }

  getByLead(leadId: string) {
    return this.http.get<any[]>(`${this.leadsTasksBase}/${leadId}/tasks`).pipe(
      map((res) => (res ?? []).map((r) => this.mapFromBackend(r))),
      catchError((err) => {
        console.error('getByLead error', err);
        return throwError(() => err?.error ?? err);
      })
    );
  }

  createTaskForLead(leadId: string, dto: TaskCreateDto) {
    const payload = this.mapToBackendCreate(dto);
    return this.http.post<any>(`${this.leadsTasksBase}/${leadId}/tasks`, payload).pipe(
      map((r) => this.mapFromBackend(r)),
      catchError((err) => {
        console.error('createTaskForLead error', err);
        return throwError(() => err?.error ?? err);
      })
    );
  }
}
