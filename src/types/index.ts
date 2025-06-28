export interface User {
  id: string;
  email?: string;
  rollNumber?: string;
  name: string;
  role: 'ADMIN' | 'STUDENT';
  brigadeId?: string;
  brigadeName?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Event {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface EventPlan {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  endTime?: string;
  associatedEventId: string;
  planType: 'withSubmission' | 'withoutSubmission';
  submissionType?: 'file' | 'text' | 'link';
  fileSizeLimit?: number;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Submission {
  id: string;
  studentId: string;
  eventPlanId: string;
  submissionType: 'file' | 'text' | 'link';
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  submittedAt: Date;
  status: 'submitted' | 'pending' | 'late';
}

export interface Brigade {
  id: string;
  name: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Analytics {
  totalStudents: number;
  activeStudents: number;
  totalSubmissions: number;
  participationRate: number;
  brigadeStats: BrigadeStats[];
  dailyParticipation: DailyParticipation[];
}

export interface BrigadeStats {
  brigadeId: string;
  brigadeName: string;
  totalStudents: number;
  totalSubmissions: number;
  participationRate: number;
}

export interface DailyParticipation {
  date: string;
  participationCount: number;
  totalActivities: number;
  participationRate: number;
}