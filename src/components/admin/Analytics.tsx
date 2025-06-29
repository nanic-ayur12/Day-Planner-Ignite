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
  BarChart3,
  AlertCircle
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
  const [selectedEvent, setSelectedEvent] = useState<string>('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
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
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as User[];

      const submissionsData = submissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date()
      })) as Submission[];

      const eventPlansData = eventPlansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as EventPlan[];

      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate() || new Date(),
        endDate: doc.data().endDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Event[];

      const brigadesData = brigadesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Brigade[];

      setUsers(usersData);
      setSubmissions(submissionsData);
      setEventPlans(eventPlansData);
      setEvents(eventsData);
      setBrigades(brigadesData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate safe statistics
  const students = users.filter(u => u.role === 'STUDENT');
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isActive).length;
  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const participationRate = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

  // Brigade performance data with safe calculations
  const brigadePerformance = brigades.map((brigade, index) => {
    const brigadeStudents = students.filter(s => s.brigadeId === brigade.id);
    const brigadeSubmissions = submissions.filter(s => 
      brigadeStudents.some(student => student.id === s.studentId)
    );
    const brigadeSubmittedCount = brigadeSubmissions.filter(s => s.status === 'submitted').length;
    const brigadeParticipationRate = brigadeStudents.length > 0 ? 
      Math.round((brigadeSubmittedCount / brigadeStudents.length) * 100) : 0;

    return {
      id: `${brigade.id}-${index}`, // Add unique key
      name: brigade.name || 'Unknown Brigade',
      students: brigadeStudents.length,
      submissions: brigadeSubmittedCount,
      participationRate: brigadeParticipationRate
    };
  });

  // Daily participation data
  const getDailyParticipation = () => {
    const days = parseInt(selectedTimeRange);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySubmissions = submissions.filter(s => 
        s.submittedAt && s.submittedAt.toISOString().split('T')[0] === dateStr
      );
      
      const participationValue = totalStudents > 0 ? 
        Math.round((daySubmissions.length / totalStudents) * 100) : 0;
      
      data.push({
        id: `day-${i}`, // Add unique key
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submissions: daySubmissions.length,
        participation: participationValue
      });
    }
    
    return data;
  };

  // Submission status data
  const submissionStatusData = [
    { id: 'submitted', name: 'Submitted', value: submissions.filter(s => s.status === 'submitted').length, color: '#10B981' },
    { id: 'pending', name: 'Pending', value: submissions.filter(s => s.status === 'pending').length, color: '#F97316' },
    { id: 'late', name: 'Late', value: submissions.filter(s => s.status === 'late').length, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Activity completion data using real event plans
  const getActivityCompletion = () => {
    // Filter event plans based on selected event
    let filteredEventPlans = eventPlans;
    if (selectedEvent !== 'ALL') {
      filteredEventPlans = eventPlans.filter(plan => plan.associatedEventId === selectedEvent);
    }

    // Only include plans that require submission
    const submissionRequiredPlans = filteredEventPlans.filter(plan => plan.planType === 'withSubmission');

    // Sort by date and take the most recent 10 plans
    const sortedPlans = submissionRequiredPlans
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    return sortedPlans.map((plan, index) => {
      const planSubmissions = submissions.filter(s => s.eventPlanId === plan.id);
      const submittedSubmissions = planSubmissions.filter(s => s.status === 'submitted');
      const completionRate = totalStudents > 0 ? Math.round((submittedSubmissions.length / totalStudents) * 100) : 0;
      
      // Truncate long titles for better display
      const displayTitle = plan.title && plan.title.length > 25 ? 
        plan.title.substring(0, 25) + '...' : 
        plan.title || 'Untitled Activity';
      
      return {
        id: `activity-${plan.id}-${index}`, // Add unique key
        name: displayTitle,
        completion: completionRate,
        submissions: submittedSubmissions.length,
        total: totalStudents,
        fullTitle: plan.title || 'Untitled Activity',
        date: plan.date.toLocaleDateString(),
        time: plan.time
      };
    });
  };

  const dailyParticipationData = getDailyParticipation();
  const activityCompletion = getActivityCompletion();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Events</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>{event.name || 'Untitled Event'}</SelectItem>
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
            <div className="text-2xl font-bold text-black">{totalStudents}</div>
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
            <div className="text-2xl font-bold text-black">{totalSubmissions}</div>
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
            <div className="text-2xl font-bold text-black">{participationRate}%</div>
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
            <div className="text-2xl font-bold text-black">{events.filter(e => e.isActive).length}</div>
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
            {dailyParticipationData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No data available for the selected period
              </div>
            )}
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
            {brigadePerformance.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No brigade data available
              </div>
            )}
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
            {submissionStatusData.length > 0 ? (
              <>
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
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {submissionStatusData.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
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
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                No submission data available
              </div>
            )}
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
              Completion percentage for recent activities requiring submission
              {selectedEvent !== 'ALL' && ` (${events.find(e => e.id === selectedEvent)?.name || 'Selected Event'})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityCompletion.length > 0 ? (
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
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div>
                            <div className="font-medium">{data.fullTitle}</div>
                            <div className="text-sm text-gray-600">{data.date} at {data.time}</div>
                          </div>
                        );
                      }
                      return label;
                    }}
                  />
                  <Bar dataKey="completion" fill="#F97316" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No activities with submission requirements found</p>
                  {selectedEvent !== 'ALL' && (
                    <p className="text-sm mt-2">Try selecting "All Events" to see more data</p>
                  )}
                </div>
              </div>
            )}
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
          {brigadePerformance.length > 0 ? (
            <div className="grid gap-4">
              {brigadePerformance.map((brigade) => (
                <div key={brigade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black">{brigade.name}</h3>
                      <p className="text-sm text-gray-600">
                        {brigade.students} students • {brigade.submissions} submissions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-black">{brigade.participationRate}%</div>
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              No brigade data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};