import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const dashboardStats = [
  { 
    title: 'Total Events', 
    value: '2', 
    change: 'Events created', 
    icon: Calendar, 
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-600'
  },
  { 
    title: 'Brigade Leads', 
    value: '0', 
    change: 'Registered leads & co-leads', 
    icon: Users, 
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    textColor: 'text-green-600'
  },
  { 
    title: 'Total Attendance', 
    value: '0', 
    change: 'Records marked', 
    icon: Target, 
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    textColor: 'text-purple-600'
  },
  { 
    title: 'Avg Attendance', 
    value: '0%', 
    change: 'Overall attendance rate', 
    icon: BarChart3, 
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    textColor: 'text-orange-600'
  },
];

const participationData = [
  { name: 'Test 1', value: 0 },
  { name: 'Test', value: 0 },
];

const submissionStatusData = [
  { name: 'Submitted', value: 0, color: '#10B981' },
  { name: 'Pending', value: 0, color: '#F59E0B' },
  { name: 'Late', value: 0, color: '#EF4444' },
];

export const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive overview of brigade lead attendance and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
              })} IST
            </span>
          </div>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            Live Data
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session-wise Attendance */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <span>Session-wise Attendance</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Comparison between FN and AN session attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No attendance data available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brigade-wise Performance */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Brigade-wise Performance</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Attendance distribution across brigades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No brigade data available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Attendance */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Target className="h-5 w-5 text-emerald-600" />
              <span>Total Attendance</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Records marked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-gray-900 mb-2">0</div>
              <div className="h-32 flex items-center justify-center">
                <div className="text-gray-400">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No records yet</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2 border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Recent Activities</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest system activities and submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'New submission received', student: 'John Doe (CS2021001)', time: '2 minutes ago', type: 'submission' },
                { action: 'Event plan created', admin: 'Admin User', time: '15 minutes ago', type: 'event' },
                { action: 'Bulk user upload completed', admin: 'Admin User', time: '1 hour ago', type: 'users' },
                { action: 'New submission received', student: 'Jane Smith (CS2021045)', time: '1 hour ago', type: 'submission' },
                { action: 'Late submission alert', student: 'Mike Johnson (CS2021089)', time: '2 hours ago', type: 'alert' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'submission' ? 'bg-green-100 text-green-600' :
                    activity.type === 'event' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'users' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {activity.type === 'submission' ? <FileText className="h-4 w-4" /> :
                     activity.type === 'event' ? <Calendar className="h-4 w-4" /> :
                     activity.type === 'users' ? <Users className="h-4 w-4" /> :
                     <AlertCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">
                      {activity.student || activity.admin} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};