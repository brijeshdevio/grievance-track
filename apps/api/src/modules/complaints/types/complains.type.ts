import { Meta } from '@/types/http.type';
import { ComplaintStatus, Role } from '@/types/prisma.type';

export type CreateComplaintResponse = {
  id: string;
  complaintNumber: string;
  title: string;
  status: ComplaintStatus;
  category: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  };
  createdAt: Date;
};

type FindAllComplaintListItem = {
  id: string;
  complaintNumber: string;
  title: string;
  location: string;
  status: ComplaintStatus;
  photoUrl: string | null;
  category: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  citizen?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type FindAllComplaintListResponse = {
  data: FindAllComplaintListItem[];
  meta: Meta;
};

export type FindOneComplaintDetailResponse = {
  id: string;
  complaintNumber: string;
  title: string;
  description: string;
  location: string;
  photoUrl: string | null;
  status: ComplaintStatus;
  rating: number | null;
  ratingComment: string | null;
  closedAt: Date | null;
  category: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  citizen?: {
    id: string;
    name: string;
    email: string;
  };
  statusHistory: {
    id: string;
    status: ComplaintStatus;
    note: string | null;
    changedBy: {
      id: string;
      name: string;
      role: Role;
    };
    createdAt: Date;
  }[];
  comments: {
    id: string;
    comment: string;
    user: {
      id: string;
      name: string;
      role: Role;
    };
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateComplaintStatusResponse = {
  id: string;
  complaintNumber: string;
  status: ComplaintStatus;
  statusHistory: {
    id: string;
    status: ComplaintStatus;
    note: string | null;
    createdAt: Date;
  };
  updatedAt: Date;
};

export type MarkComplaintInvalidResponse = {
  id: string;
  complaintNumber: string;
  status: ComplaintStatus;
  closedAt: Date | null;
};

export type RateComplaintResponse = {
  id: string;
  complaintNumber: string;
  rating: number | null;
  ratingComment: string | null;
  status: ComplaintStatus;
  closedAt: Date | null;
};
