import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const dashboardStats = [
  { 
    title: 'Total Events', 
    value: '2', 
    change: '+0%', 
    trend: 'neutral',
    description: 'Active events', 
    icon: Calendar, 
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  { 
    title: 'Brigade Leads', 
    value: '0', 
    change: '+0%', 
    trend: 'neutral',
    description: 'Registered leads', 
    icon: Users, 
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200'
  },
  { 
    title: 'Total Submissions', 
    value: '0', 
    change: '+0%', 
    trend: 'neutral',
    description: 'Records submitted', 
    icon: FileText, 
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200'
  },
  { 
    title: 'Completion Rate', 
    value: '0%', 
    change: '+0%', 
    trend: 'neutral',
    description: 'Overall progress', 
    icon: Target, 
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-200'
  },
];

const recentActivities = [
  { action: 'System initialized', user: 'Admin User', time: '2 hours ago', type: 'system', icon: Activity },
  { action: 'Event plan template created', user: 'Admin User', time: '3 hours ago', type: 'event', icon: Calendar },
  { action: 'User management setup', user: 'Admin User', time: '4 hours ago', type: 'users', icon: Users },
  { action: 'Analytics dashboard configured', user: 'Admin User', time: '5 hours ago', type: 'analytics', icon: BarChart3 },
];

const chartData = [
  { name: 'Mon', submissions: 0, events: 0 },
  { name: 'Tue', submissions: 0, events: 0 },
  { name: 'Wed', submissions: 0, events: 1 },
  { name: 'Thu', submissions: 0, events: 1 },
  { name: 'Fri', submissions: 0, events: 2 },
  { name: 'Sat', submissions: 0, events: 2 },
  { name: 'Sun', submissions: 0, events: 2 },
];

export const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your brigade management system.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })} IST
            </span>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Quick Action
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${stat.bgColor} ${stat.borderColor} border-l-4`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  <div className={`flex items-center text-xs font-medium ${
                    stat.trend === 'up' ? 'text-emerald-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
                    {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
                    <span>{stat.change}</span>
                  </div>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor.replace('50', '100')}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 font-medium">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Overview */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Weekly Activity</span>
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Events and submissions over the past week
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="events" 
                  stackId="1"
                  stroke="#8b5cf6" 
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="submissions" 
                  stackId="1"
                  stroke="#06b6d4" 
                  fill="#06b6d4"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Activity className="h-5 w-5 text-emerald-600" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Current system health and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-900">Database</p>
                    <p className="text-sm text-emerald-700">Connected & Operational</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Authentication</p>
                    <p className="text-sm text-blue-700">Firebase Auth Active</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-900">File Storage</p>
                    <p className="text-sm text-purple-700">Cloud Storage Ready</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Clock className="h-5 w-5 text-orange-600" />
                <span>Recent Activities</span>
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Latest system activities and updates
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'system' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'event' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'users' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">
                    by {activity.user} • {activity.time}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};