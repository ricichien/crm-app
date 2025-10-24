import { TaskPriority, TaskStatus } from './task.model';

export * from './lead.model';

export const LEAD_SOURCE_OPTIONS = [
  { value: 'web', label: 'Web' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' }
];

export const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' }
];

export const TASK_STATUS_OPTIONS = Object.entries(TaskStatus).map(([key, value]) => ({
  value,
  label:
    value === 'Pending' ? 'Pending'
    : value === 'InProgress' ? 'In Progress'
    : value === 'Completed' ? 'Completed'
    : value === 'Deferred' ? 'Deferred'
    : 'Cancelled'
}));

export const TASK_PRIORITY_OPTIONS = Object.entries(TaskPriority).map(([key, value]) => ({
  value,
  label:
    value === 'Low' ? 'Low'
    : value === 'Medium' ? 'Medium'
    : value === 'High' ? 'High'
    : 'Urgent'
}));

export const TASK_ORDER_LABELS: Record<number, string> = {
  0: 'Início de projeto',
  1: 'Contato inicial',
  2: 'Proposta enviada',
  3: 'Negociação',
  4: 'Fechamento',
  5: 'Pós-venda'
};


