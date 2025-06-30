import api from './client';

export interface Analytics {
  overview: {
    totalStudents: number;
    activeStudents: number;
    totalSubmissions: number;
    submittedCount: number;
    participationRate: number;
    totalEvents: number;
  };
  brigadePerformance: Array<{
    id: string;
    name: string;
    students: number;
    submissions: number;
    participationRate: number;
  }>;
  dailyParticipation: Array<{
    date: string;
    submissions: number;
    participation: number;
  }>;
  statusBreakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  activityCompletion: Array<{
    id: string;
    name: string;
    completion: number;
    submissions: number;
    total: number;
    fullTitle: string;
    date: string;
    time: string;
  }>;
}

export interface AnalyticsQueryParams {
  eventId?: string;
  timeRange?: '7' | '14' | '30';
}

export const analyticsAPI = {
  getAll: (params?: AnalyticsQueryParams) => 
    api.get<Analytics>('/analytics', { params }),
};