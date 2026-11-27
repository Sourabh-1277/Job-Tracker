export type UserRole = 'CANDIDATE' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
}