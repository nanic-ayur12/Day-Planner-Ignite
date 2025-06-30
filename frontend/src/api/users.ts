import api from './client';

export interface User {
  id: string;
  email?: string;
  rollNumber?: string;
  name: string;
  role: 'ADMIN' | 'STUDENT';
  brigadeId?: string;
  brigadeName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email?: string;
  rollNumber?: string;
  password: string;
  role: 'ADMIN' | 'STUDENT';
  brigadeId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  rollNumber?: string;
  brigadeId?: string;
  isActive?: boolean;
}

export interface UsersQueryParams {
  role?: 'ADMIN' | 'STUDENT';
  brigadeId?: string;
  search?: string;
}

export const usersAPI = {
  getAll: (params?: UsersQueryParams) => 
    api.get<User[]>('/users', { params }),
  
  create: (data: CreateUserRequest) => 
    api.post<User>('/users', data),
  
  update: (id: string, data: UpdateUserRequest) => 
    api.put<User>(`/users/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/users/${id}`),
};