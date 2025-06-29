import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  Award,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Submission, EventPlan, Event, Brigade } from '@/types';

export const Analytics: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [eventPlans, setEventPlans] = useState<EventPlan[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
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
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const students = users.filter(u => u.role === 'STUDENT');
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isActive).length;
  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const participationRate = totalStudents > 0 ? (submittedCount / totalStudents) * 100 : 0;

  // Brigade performance data with NaN protection
  const brigadePerformance = brigades.map(brigade => {
    const brigadeStudents = students.filter(s => s.brigadeId === brigade.id);
    const brigadeSubmissions = submissions.filter(s => 
      brigadeStudents.some(student => student.id === s.studentId)
    );
    const brigadeSubmittedCount = brigadeSubmissions.filter(s => s.status === 'submitted').length;
    const brigadeParticipationRate = brigadeStudents.length > 0 ? 
      (brigadeSubmittedCount / brigadeStudents.length) * 100 : 0;

    // Ensure all values are valid numbers
    const safeParticipationRate = isNaN(brigadeParticipationRate) ? 0 : Math.round(brigadeParticipationRate);

    return {
      name: brigade.name,
      students: brigadeStudents.length,
      submissions: brigadeSubmittedCount,
      participationRate: safeParticipationRate
    };
  });

  // Daily participation data with NaN protection
  const getDailyParticipation = () => {
    const days = parseInt(selectedTimeRange);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySubmissions = submissions.filter(s => 
        s.submittedAt.toISOString().split('T')[0] === dateStr
      );
      
      // Ensure participation is always a valid number, never NaN
      const participationValue = totalStudents > 0 ? 
        (daySubmissions.length / totalStudents) * 100 : 0;
      
      const safeParticipationValue = isNaN(participationValue) ? 0 : Math.round(participationValue);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submissions: daySubmissions.length,
        participation: safeParticipationValue
      });
    }
    
    return data;
  };

  // Submission status data
  const submissionStatusData = [
    { name: 'Submitted', value: submissions.filter(s => s.status === 'submitted').length, color: '#10B981' },
    { name: 'Pending', value: submissions.filter(s => s.status === 'pending').length, color: '#F59E0B' },
    { name: 'Late', value: submissions.filter(s => s.status === 'late').length, color: '#EF4444' }
  ];

  // Activity completion data with NaN protection
  const activityCompletion = eventPlans.map(plan => {
    const planSubmissions = submissions.filter(s => s.eventPlanId === plan.id);
    const completionRate = totalStudents > 0 ? (planSubmissions.length / totalStudents) * 100 : 0;
    const safeCompletionRate = isNaN(completionRate) ? 0 : Math.round(completionRate);
    
    return {
      name: plan.title.length > 20 ? plan.title.substring(0, 20) + '...' : plan.title,
      completion: safeCompletionRate,
      submissions: planSubmissions.length,
      total: totalStudents
    };
  });

  const dailyParticipationData = getDailyParticipation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Events</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-green-600 font-medium">
              {activeStudents} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-green-600 font-medium">
              {submittedCount} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Participation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(participationRate)}%</div>
            <p className="text-xs text-gray-600">
              Overall engagement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter(e => e.isActive).length}</div>
            <p className="text-xs text-gray-600">
              {eventPlans.length} total activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Participation Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Daily Participation Trend</span>
            </CardTitle>
            <CardDescription>
              Submission activity over the past {selectedTimeRange} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyParticipationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 'auto']} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'submissions' ? `${value} submissions` : `${value}%`,
                    name === 'submissions' ? 'Submissions' : 'Participation Rate'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="submissions" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Brigade Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Brigade Performance</span>
            </CardTitle>
            <CardDescription>
              Participation rates by brigade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={brigadePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'participationRate' ? `${value}%` : value,
                    name === 'participationRate' ? 'Participation Rate' : 
                    name === 'students' ? 'Total Students' : 'Submissions'
                  ]}
                />
                <Bar dataKey="participationRate" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Submission Status</span>
            </CardTitle>
            <CardDescription>
              Current submission breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
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
                <Tooltip formatter={(value) => [`${value}`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {submissionStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Completion */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Activity Completion Rates</span>
            </CardTitle>
            <CardDescription>
              Completion percentage for each activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityCompletion} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'completion' ? `${value}%` : value,
                    name === 'completion' ? 'Completion Rate' : 'Submissions'
                  ]}
                />
                <Bar dataKey="completion" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Brigade Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Brigade Statistics</CardTitle>
          <CardDescription>
            Comprehensive performance metrics by brigade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {brigadePerformance.map((brigade, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{brigade.name}</h3>
                    <p className="text-sm text-gray-600">
                      {brigade.students} students • {brigade.submissions} submissions
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-bold">{brigade.participationRate}%</div>
                    <div className="text-xs text-gray-600">Participation</div>
                  </div>
                  <Badge 
                    variant={brigade.participationRate >= 80 ? 'default' : 
                            brigade.participationRate >= 60 ? 'secondary' : 'destructive'}
                  >
                    {brigade.participationRate >= 80 ? 'Excellent' : 
                     brigade.participationRate >= 60 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};