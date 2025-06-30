import api from './client';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  method?: string;
  url?: string;
  statusCode?: number;
  userId?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  meta?: Record<string, any>;
}

export interface LogsQueryParams {
  level?: 'info' | 'warn' | 'error' | 'debug';
  method?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  totalPages: number;
}

export const logsAPI = {
  getAll: (params?: LogsQueryParams) => 
    api.get<LogsResponse>('/logs', { params }),
  
  getStats: () => 
    api.get<{
      totalRequests: number;
      errorRate: number;
      averageResponseTime: number;
      topEndpoints: Array<{ endpoint: string; count: number }>;
      recentErrors: LogEntry[];
    }>('/logs/stats'),
};