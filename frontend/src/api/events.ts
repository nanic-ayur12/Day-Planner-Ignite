import api from './client';

export interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  creator?: {
    id: string;
    name: string;
  };
  _count?: {
    eventPlans: number;
  };
}

export interface CreateEventRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateEventRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface EventsQueryParams {
  isActive?: boolean;
}

export const eventsAPI = {
  getAll: (params?: EventsQueryParams) => 
    api.get<Event[]>('/events', { params }),
  
  create: (data: CreateEventRequest) => 
    api.post<Event>('/events', data),
  
  update: (id: string, data: UpdateEventRequest) => 
    api.put<Event>(`/events/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/events/${id}`),
};