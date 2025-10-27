import { LeadSource, LeadStatus } from '../enums/lead.enum';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  lastModifiedAt?: string;
}

export interface LeadCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
}

export interface LeadUpdateDto extends Partial<LeadCreateDto> {}

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export { LeadSource, LeadStatus };
