import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  LineChart,
  Line
} from 'recharts';
import { 
  Trophy, 
  Target, 
  Calendar, 
  FileText,
  TrendingUp,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Submission, EventPlan, Event, User } from '@/types';

export const StudentDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [eventPlans, setEventPlans] = useState<EventPlan[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [brigadeStudents, setBrigadeStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.id) {
      fetchData();
    }
  }, [userProfile]);

  const fetchData = async () => {
    if (!userProfile?.id) return;
    
    setLoading(true);
    try {
      // Fetch user's submissions
      const submissionsQuery = query(
        collection(db, 'submissions'), 
        where('studentId', '==', userProfile.id)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      // Fetch all event plans, events, and brigade students
      const [eventPlansSnapshot, eventsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'eventPlans')),
        getDocs(collection(db, 'events')),
        getDocs(query(collection(db, 'users'), where('brigadeId', '==', userProfile.brigadeId || '')))
      ]);

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

      const brigadeStudentsData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as User[];

      setSubmissions(submissionsData);
      setEventPlans(eventPlansData);
      setEvents(eventsData);
      setBrigadeStudents(brigadeStudentsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const lateCount = submissions.filter(s => s.status === 'late').length;

  const submissionRequiredPlans = eventPlans.filter(plan => plan.planType === 'withSubmission');
  const totalRequiredSubmissions = submissionRequiredPlans.length;
  const completionRate = totalRequiredSubmissions > 0 ? (submittedCount / totalRequiredSubmissions) * 100 : 0;

  // Brigade comparison
  const brigadeSubmissions = brigadeStudents.map(student => {
    // This would need actual submission data for each student
    // For demo purposes, we'll use mock data
    return Math.floor(Math.random() * totalRequiredSubmissions);
  });
  const brigadeAverage = brigadeSubmissions.length > 0 ? 
    brigadeSubmissions.reduce((a, b) => a + b, 0) / brigadeSubmissions.length : 0;
  const myRankInBrigade = brigadeSubmissions.filter(count => count < submittedCount).length + 1;

  // Weekly progress data
  const getWeeklyProgress = () => {
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySubmissions = submissions.filter(s => 
        s.submittedAt.toISOString().split('T')[0] === dateStr
      );
      
      weekData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        submissions: daySubmissions.length
      });
    }
    return weekData;
  };

  // Submission status data for pie chart
  const statusData = [
    { name: 'Completed', value: submittedCount, color: '#10B981' },
    { name: 'Pending', value: pendingCount, color: '#F59E0B' },
    { name: 'Late', value: lateCount, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Recent activities
  const recentSubmissions = submissions
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    .slice(0, 5)
    .map(submission => {
      const eventPlan = eventPlans.find(ep => ep.id === submission.eventPlanId);
      const event = events.find(e => e.id === eventPlan?.associatedEventId);
      return {
        ...submission,
        eventPlanTitle: eventPlan?.title,
        eventName: event?.name
      };
    });

  const weeklyData = getWeeklyProgress();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userProfile?.name}!</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {userProfile?.brigadeName}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">
              {submittedCount} of {totalRequiredSubmissions} completed
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
              {submittedCount} successful
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Brigade Rank</CardTitle>
            <Trophy className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{myRankInBrigade}</div>
            <p className="text-xs text-gray-600">
              out of {brigadeStudents.length} students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyData.reduce((sum, day) => sum + day.submissions, 0)}
            </div>
            <p className="text-xs text-gray-600">submissions made</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Weekly Activity</span>
            </CardTitle>
            <CardDescription>
              Your submission activity over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}`, 'Submissions']} />
                <Line 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Submission Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Submission Status</span>
            </CardTitle>
            <CardDescription>
              Breakdown of your submission statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No submissions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest submissions and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.map((submission, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      submission.status === 'submitted' ? 'bg-green-100 text-green-600' :
                      submission.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{submission.eventPlanTitle}</p>
                      <p className="text-xs text-gray-600">
                        {submission.eventName} • {submission.submittedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={submission.status === 'submitted' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {submission.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Performance Insights</span>
            </CardTitle>
            <CardDescription>
              How you're doing compared to your brigade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Your Submissions</p>
                  <p className="text-xs text-gray-600">Total completed</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{submittedCount}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Brigade Average</p>
                  <p className="text-xs text-gray-600">Average submissions</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-600">{Math.round(brigadeAverage)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Your Rank</p>
                  <p className="text-xs text-gray-600">In {userProfile?.brigadeName}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">#{myRankInBrigade}</div>
                </div>
              </div>
              {submittedCount > brigadeAverage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">🎉 Great job!</p>
                  <p className="text-xs text-green-700">You're performing above brigade average!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};