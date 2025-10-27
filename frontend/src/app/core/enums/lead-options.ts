import { LeadStatus, LeadSource } from './lead.enum';

export const LEAD_STATUS_OPTIONS = Object.entries(LeadStatus).map(([key, value]) => ({
  value,
  label: value,
}));

export const LEAD_SOURCE_OPTIONS = Object.entries(LeadSource).map(([key, value]) => ({
  value,
  label: value,
}));
