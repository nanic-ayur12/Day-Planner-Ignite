import api from './client';

export interface LoginRequest {
  identifier: string;
  password: string;
  isStudent?: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email?: string;
    rollNumber?: string;
    name: string;
    role: 'ADMIN' | 'STUDENT';
    brigadeId?: string;
    brigadeName?: string;
    isActive: boolean;
  };
}

export interface UserProfile {
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

export const authAPI = {
  login: (data: LoginRequest) => 
    api.post<LoginResponse>('/auth/login', data),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getProfile: () => 
    api.get<UserProfile>('/auth/profile'),
};