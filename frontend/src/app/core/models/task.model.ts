export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Deferred = 'Deferred',
  Cancelled = 'Cancelled',
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null; // ISO string or null
  priority?: TaskPriority;
  status: TaskStatus;
  leadId?: string;
  order?: number;
  createdAt?: string;
  lastModifiedAt?: string;
  lead?: any;
}

/** DTOs usados para criar / atualizar */
export interface TaskCreateDto {
  title: string;
  description?: string;
  dueDate?: string | null; // aceita null
  priority?: TaskPriority;
  status?: TaskStatus;
  leadId?: string | undefined;
  order?: number;
}

export interface TaskUpdateDto {
  title?: string;
  description?: string;
  dueDate?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  leadId?: string | null;
  order?: number;
}
