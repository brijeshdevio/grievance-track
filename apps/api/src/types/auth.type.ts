import { Role } from './prisma.type';

export interface CurrentUserType {
  id: string;
  email: string;
  role: Role;
}
