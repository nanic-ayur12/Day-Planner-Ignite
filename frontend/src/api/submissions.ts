import api from './client';

export interface Submission {
  id: string;
  studentId: string;
  eventPlanId: string;
  submissionType: 'file' | 'text' | 'link';
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  status: 'submitted' | 'pending' | 'late';
  submittedAt: string;
  student?: {
    id: string;
    name: string;
    rollNumber?: string;
    brigadeName?: string;
  };
  eventPlan?: {
    id: string;
    title: string;
    associatedEvent?: {
      id: string;
      name: string;
    };
  };
}

export interface CreateSubmissionRequest {
  eventPlanId: string;
  submissionType: 'file' | 'text' | 'link';
  content?: string;
  file?: File;
}

export interface UpdateSubmissionStatusRequest {
  status: 'submitted' | 'pending' | 'late';
}

export interface SubmissionsQueryParams {
  studentId?: string;
  eventPlanId?: string;
  status?: 'submitted' | 'pending' | 'late';
}

export const submissionsAPI = {
  getAll: (params?: SubmissionsQueryParams) => 
    api.get<Submission[]>('/submissions', { params }),
  
  create: (data: CreateSubmissionRequest) => {
    const formData = new FormData();
    formData.append('eventPlanId', data.eventPlanId);
    formData.append('submissionType', data.submissionType);
    
    if (data.content) {
      formData.append('content', data.content);
    }
    
    if (data.file) {
      formData.append('file', data.file);
    }
    
    return api.post<Submission>('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  updateStatus: (id: string, data: UpdateSubmissionStatusRequest) => 
    api.put<Submission>(`/submissions/${id}/status`, data),
  
  delete: (id: string) => 
    api.delete(`/submissions/${id}`),
};