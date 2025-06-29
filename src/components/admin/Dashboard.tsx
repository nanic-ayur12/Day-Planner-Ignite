import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  FileText, 
  Activity,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Submission, EventPlan, Event, Brigade } from '@/types';

export const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [eventPlans, setEventPlans] = useState<EventPlan[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, []);

  const fetchLiveData = async () => {
    try {
      const [usersSnapshot, submissionsSnapshot, eventPlansSnapshot, eventsSnapshot, brigadesSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'submissions')),
        getDocs(collection(db, 'eventPlans')),
        getDocs(collection(db, 'events')),
        getDocs(collection(db, 'brigades'))
      ]);

      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as User[];

      const submissionsData = submissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt.toDate()
      })) as Submission[];

      const eventPlansData = eventPlansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as EventPlan[];

      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
        endDate: doc.data().endDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as Event[];

      const brigadesData = brigadesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Brigade[];

      setUsers(usersData);
      setSubmissions(submissionsData);
      setEventPlans(eventPlansData);
      setEvents(eventsData);
      setBrigades(brigadesData);
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  // Calculate live statistics
  const totalEvents = events.filter(e => e.isActive).length;
  const totalStudents = users.filter(u => u.role === 'STUDENT').length;
  const activeStudents = users.filter(u => u.role === 'STUDENT' && u.isActive).length;
  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const submissionRequiredPlans = eventPlans.filter(plan => plan.planType === 'withSubmission').length;
  const completionRate = submissionRequiredPlans > 0 ? (submittedCount / (submissionRequiredPlans * totalStudents)) * 100 : 0;

  const dashboardStats = [
    { 
      title: 'Total Events', 
      value: totalEvents.toString(), 
      change: totalEvents > 0 ? '+100%' : '0%', 
      trend: totalEvents > 0 ? 'up' : 'neutral',
      description: 'Active events', 
      icon: Calendar, 
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    { 
      title: 'Active Students', 
      value: activeStudents.toString(), 
      change: activeStudents > 0 ? `${Math.round((activeStudents/totalStudents)*100)}%` : '0%', 
      trend: activeStudents > 0 ? 'up' : 'neutral',
      description: `${totalStudents} total students`, 
      icon: Users, 
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    { 
      title: 'Total Submissions', 
      value: totalSubmissions.toString(), 
      change: totalSubmissions > 0 ? '+100%' : '0%', 
      trend: totalSubmissions > 0 ? 'up' : 'neutral',
      description: `${submittedCount} completed`, 
      icon: FileText, 
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    { 
      title: 'Completion Rate', 
      value: `${Math.round(completionRate)}%`, 
      change: completionRate > 50 ? '+Good' : completionRate > 0 ? 'Average' : 'Low', 
      trend: completionRate > 50 ? 'up' : completionRate > 0 ? 'neutral' : 'down',
      description: 'Overall progress', 
      icon: Target, 
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
  ];

  // Generate weekly chart data
  const getWeeklyData = () => {
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySubmissions = submissions.filter(s => 
        s.submittedAt.toISOString().split('T')[0] === dateStr
      );
      
      const dayEvents = events.filter(e => 
        e.createdAt.toISOString().split('T')[0] === dateStr
      );
      
      weekData.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        submissions: daySubmissions.length,
        events: dayEvents.length
      });
    }
    return weekData;
  };

  // Brigade comparison data
  const getBrigadeComparison = () => {
    return brigades.map(brigade => {
      const brigadeStudents = users.filter(u => u.brigadeId === brigade.id);
      const brigadeSubmissions = submissions.filter(s => 
        brigadeStudents.some(student => student.id === s.studentId)
      );
      const brigadeSubmittedCount = brigadeSubmissions.filter(s => s.status === 'submitted').length;
      const participationRate = brigadeStudents.length > 0 ? 
        (brigadeSubmittedCount / brigadeStudents.length) * 100 : 0;

      return {
        name: brigade.name.replace(' Brigade', ''),
        students: brigadeStudents.length,
        submissions: brigadeSubmittedCount,
        participationRate: Math.round(participationRate)
      };
    });
  };

  const chartData = getWeeklyData();
  const brigadeData = getBrigadeComparison();

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-black">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">
            Real-time insights into your brigade management system performance.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })} IST
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className={`border shadow-sm hover:shadow-md transition-all duration-300 ${stat.bgColor} ${stat.borderColor} border-l-4`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-black">{stat.value}</span>
                  <div className={`flex items-center text-xs font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 
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
        {/* Weekly Activity */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-black">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Weekly Activity</span>
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Events and submissions over the past week
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
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

        {/* Brigade Performance Comparison */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <Users className="h-5 w-5 text-green-600" />
              <span>Brigade Performance</span>
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Participation rates across different brigades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={brigadeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'participationRate' ? `${value}%` : value,
                    name === 'participationRate' ? 'Participation Rate' : 
                    name === 'students' ? 'Total Students' : 'Submissions'
                  ]}
                />
                <Bar dataKey="participationRate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>System Performance</span>
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Key performance indicators and comparisons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Student Engagement</p>
                    <p className="text-sm text-blue-700">{Math.round((activeStudents/totalStudents)*100)}% active participation</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-900">{activeStudents}/{totalStudents}</div>
                  <div className="text-xs text-blue-600">Students</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Submission Rate</p>
                    <p className="text-sm text-green-700">{Math.round((submittedCount/totalSubmissions)*100)}% completion rate</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-900">{submittedCount}/{totalSubmissions}</div>
                  <div className="text-xs text-green-600">Submissions</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">Event Efficiency</p>
                    <p className="text-sm text-purple-700">{eventPlans.length} activities planned</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-900">{totalEvents}</div>
                  <div className="text-xs text-purple-600">Active Events</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brigade Comparison Details */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <Target className="h-5 w-5 text-orange-600" />
              <span>Brigade Rankings</span>
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Performance ranking by brigade participation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {brigadeData
                .sort((a, b) => b.participationRate - a.participationRate)
                .map((brigade, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-white text-black border-2 border-gray-300' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">{brigade.name}</h3>
                      <p className="text-sm text-gray-600">
                        {brigade.students} students • {brigade.submissions} submissions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-black">{brigade.participationRate}%</div>
                    <div className="text-xs text-gray-600">Participation</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Footer */}
       <div className="p-4">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-black"></p>
              <p className="text-xs text-gray-600"></p>
            </div>
          </div>
        </div> 
      </div>
    </div>
  );
};