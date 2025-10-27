// export enum TaskStatus {
//   Pending = 'Pending',
//   InProgress = 'InProgress',
//   Completed = 'Completed',
//   Deferred = 'Deferred',
//   Cancelled = 'Cancelled',
// }

// export enum TaskPriority {
//   Low = 'Low',
//   Medium = 'Medium',
//   High = 'High',
//   Urgent = 'Urgent',
// }

// export interface Task {
//   id: string;
//   title: string;
//   description?: string;
//   dueDate?: string | null; // ISO string or null
//   priority?: TaskPriority;
//   status: TaskStatus;
//   leadId?: string;
//   order?: number;
//   createdAt?: string;
//   lastModifiedAt?: string;
//   lead?: any;
//   isUrgent?: boolean;
//   leadName?: string;
//   leadAvatarUrl?: string;
//   price?: number;
// }

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
  isUrgent?: boolean;

  // novos/úteis para UI
  leadName?: string; // ex: "Lisa Runner"
  leadAvatarUrl?: string; // ex: url to avatar image
  leadCompany?: string; // ex: "Acme Co."
  price?: number; // ex: 450
  amount?: number; // alias, se você vem usando 'amount' em outros lugares
  tag?: string; // ex: "Demo"
  statusLabel?: string; // ex: "Sem tarefas"

  // outros campos extras que você já tinha
  // ...
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
