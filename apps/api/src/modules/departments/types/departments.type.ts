import { Meta } from '@/types/http.type';

export type CreateDepartmentResponse = {
  id: string;
  name: string;
  isActive: boolean;
  account: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
};

type FindAllDepartmentListItem = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  account: {
    id: string;
    email: string;
  } | null;
  createdAt: Date;
};

export type FindAllDepartmentListResponse = {
  data: FindAllDepartmentListItem[];
  meta: Meta;
};

export type FindOneDepartmentDetailResponse = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  avgResolutionDays: number;
  avgRating: number | null;
  categories: {
    id: string;
    name: string;
    isActive: boolean;
  }[];
  account: {
    id: string;
    email: string;
  } | null;
  createdAt: Date;
};

export type UpdateDepartmentResponse = {
  id: string;
  name: string;
  isActive: boolean;
  updatedAt: Date;
};

export type PublicDepartmentResponse = {
  id: string;
  name: string;
};
