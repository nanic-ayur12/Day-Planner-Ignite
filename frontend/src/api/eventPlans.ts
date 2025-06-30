import api from './client';

export interface EventPlan {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  associatedEventId: string;
  planType: 'withSubmission' | 'withoutSubmission';
  submissionType?: 'file' | 'text' | 'link';
  fileSizeLimit?: number;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  associatedEvent?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    name: string;
  };
  _count?: {
    submissions: number;
  };
}

export interface CreateEventPlanRequest {
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  associatedEventId: string;
  planType: 'withSubmission' | 'withoutSubmission';
  submissionType?: 'file' | 'text' | 'link';
  fileSizeLimit?: number;
}

export interface UpdateEventPlanRequest {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  endTime?: string;
  isActive?: boolean;
}

export interface EventPlansQueryParams {
  eventId?: string;
  date?: string;
  planType?: 'withSubmission' | 'withoutSubmission';
}

export const eventPlansAPI = {
  getAll: (params?: EventPlansQueryParams) => 
    api.get<EventPlan[]>('/event-plans', { params }),
  
  create: (data: CreateEventPlanRequest) => 
    api.post<EventPlan>('/event-plans', data),
  
  update: (id: string, data: UpdateEventPlanRequest) => 
    api.put<EventPlan>(`/event-plans/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/event-plans/${id}`),
};