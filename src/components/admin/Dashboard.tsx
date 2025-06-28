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
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const dashboardStats = [
  { title: 'Total Students', value: '248', change: '+12%', icon: Users, color: 'bg-blue-600' },
  { title: 'Active Events', value: '5', change: '+2', icon: Calendar, color: 'bg-green-600' },
  { title: 'Today\'s Activities', value: '8', change: '+1', icon: Activity, color: 'bg-orange-600' },
  { title: 'Submissions Today', value: '186', change: '+24%', icon: FileText, color: 'bg-purple-600' },
];

const participationData = [
  { date: '2024-01-15', participation: 85 },
  { date: '2024-01-16', participation: 92 },
  { date: '2024-01-17', participation: 88 },
  { date: '2024-01-18', participation: 95 },
  { date: '2024-01-19', participation: 89 },
  { date: '2024-01-20', participation: 96 },
  { date: '2024-01-21', participation: 93 },
];

const brigadeData = [
  { name: 'Alpha', submissions: 45, total: 50 },
  { name: 'Beta', submissions: 42, total: 48 },
  { name: 'Gamma', submissions: 38, total: 45 },
  { name: 'Delta', submissions: 41, total: 47 },
  { name: 'Epsilon', submissions: 39, total: 44 },
];

const submissionStatusData = [
  { name: 'Submitted', value: 186, color: '#10B981' },
  { name: 'Pending', value: 45, color: '#F59E0B' },
  { name: 'Late', value: 17, color: '#EF4444' },
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • {currentTime.toLocaleTimeString()}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-100 text-green-800 w-fit">
          Live Data
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-green-600 font-medium mt-1">
                {stat.change} from yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participation Trend */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <TrendingUp className="h-5 w-5" />
              <span>Daily Participation Trend</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Student participation rate over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#6B7280"
                />
                <YAxis domain={[80, 100]} stroke="#6B7280" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`${value}%`, 'Participation Rate']}
                  contentStyle={{ backgroundColor: 'white', border: '2px solid #E5E7EB' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="participation" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Brigade Performance */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Users className="h-5 w-5" />
              <span>Brigade Performance</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Submission rates by brigade today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={brigadeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'submissions' ? `${value} submitted` : `${value} total`,
                    name === 'submissions' ? 'Submissions' : 'Total Students'
                  ]}
                  contentStyle={{ backgroundColor: 'white', border: '2px solid #E5E7EB' }}
                />
                <Bar dataKey="total" fill="#E5E7EB" name="total" />
                <Bar dataKey="submissions" fill="#10B981" name="submissions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Status */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <CheckCircle className="h-5 w-5" />
              <span>Submission Status</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Current submission breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={submissionStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {submissionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Count']} 
                  contentStyle={{ backgroundColor: 'white', border: '2px solid #E5E7EB' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {submissionStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2 border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Clock className="h-5 w-5" />
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
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'submission' ? 'bg-green-600' :
                    activity.type === 'event' ? 'bg-blue-600' :
                    activity.type === 'users' ? 'bg-purple-600' :
                    'bg-orange-600'
                  }`}>
                    {activity.type === 'submission' ? <FileText className="h-4 w-4 text-white" /> :
                     activity.type === 'event' ? <Calendar className="h-4 w-4 text-white" /> :
                     activity.type === 'users' ? <Users className="h-4 w-4 text-white" /> :
                     <AlertCircle className="h-4 w-4 text-white" />}
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