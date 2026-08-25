import { Meta } from '@/types/http.type';

export type CreateCategoryResponse = {
  id: string;
  name: string;
  isActive: boolean;
  department: {
    id: string;
    name: string;
  };
  createdAt: Date;
};

type FindAllCategoryListItem = {
  id: string;
  name: string;
  isActive: boolean;
  department: {
    id: string;
    name: string;
  };
};

export type FindAllCategoryListResponse = {
  data: FindAllCategoryListItem[];
  meta: Meta;
};

export type UpdateCategoryResponse = {
  id: string;
  name: string;
  isActive: boolean;
  department: {
    id: string;
    name: string;
  };
  updatedAt: Date;
};

export type PublicCategoryResponse = {
  id: string;
  name: string;
  departmentId: string;
};
