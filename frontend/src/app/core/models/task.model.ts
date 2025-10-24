import { Lead } from './lead.model';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string format
  priority: TaskPriority;
  status: TaskStatus;
  leadId?: string;
  lead?: Lead;
  order: number;
  createdAt: string;
  lastModifiedAt?: string;
}

export interface TaskCreateDto {
  title: string;
  description?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  leadId?: string;
  order: number;
}

export interface TaskUpdateDto extends Partial<TaskCreateDto> {}

export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Deferred = 'Deferred',
  Cancelled = 'Cancelled'
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent'
}
