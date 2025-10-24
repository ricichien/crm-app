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

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Unqualified = 'Unqualified',
  Customer = 'Customer'
}

export enum LeadSource {
  Website = 'Website',
  Referral = 'Referral',
  SocialMedia = 'SocialMedia',
  Email = 'Email',
  Other = 'Other'
}

export const LEAD_STATUS_OPTIONS = Object.entries(LeadStatus).map(([key, value]) => ({
  value,
  label: value
}));

export const LEAD_SOURCE_OPTIONS = Object.entries(LeadSource).map(([key, value]) => ({
  value,
  label: value
}));