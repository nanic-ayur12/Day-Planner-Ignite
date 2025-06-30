import api from './client';

export interface Brigade {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    users: number;
  };
}

export interface CreateBrigadeRequest {
  name: string;
}

export interface UpdateBrigadeRequest {
  name: string;
}

export const brigadesAPI = {
  getAll: () => 
    api.get<Brigade[]>('/brigades'),
  
  create: (data: CreateBrigadeRequest) => 
    api.post<Brigade>('/brigades', data),
  
  update: (id: string, data: UpdateBrigadeRequest) => 
    api.put<Brigade>(`/brigades/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/brigades/${id}`),
};