export * from '@/generated/prisma/client';
export * from '@/generated/prisma/enums';

export const Role = {
  CITIZEN: 'CITIZEN',
  DEPARTMENT: 'DEPARTMENT',
  ADMIN: 'ADMIN',
} as const;

export const ComplaintStatus = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
