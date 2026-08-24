import { Role } from '@/types/prisma.type';

type JWTType = 'access' | 'refresh';

export interface JWTTokenPayload {
  sub: string;
  email: string;
  role: Role;
  type: JWTType;
  iat?: number;
  exp?: number;
}

export type RegisterResponse = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type ProfileResponse = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  role: Role;
  isActive: boolean;
  departmentId: string | null;
};
