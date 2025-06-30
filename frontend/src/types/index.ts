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
  creator?: {
    id: string;
    name: string;
  };
  _count?: {
    eventPlans: number;
  };
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

export interface Brigade {
  id: string;
  name: string;
  createdAt: Date;
  isActive: boolean;
  _count?: {
    users: number;
  };
}

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