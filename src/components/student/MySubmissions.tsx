import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Submission, EventPlan, Event } from '@/types';

export const MySubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<(Submission & { 
    eventPlanTitle?: string; 
    eventName?: string;
    eventPlan?: EventPlan;
  })[]>([]);
  const [eventPlans, setEventPlans] = useState<EventPlan[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
        where('studentId', '==', userProfile.id),
        orderBy('submittedAt', 'desc')
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      // Fetch all event plans and events
      const [eventPlansSnapshot, eventsSnapshot] = await Promise.all([
        getDocs(collection(db, 'eventPlans')),
        getDocs(collection(db, 'events'))
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

      // Enrich submissions with related data
      const enrichedSubmissions = submissionsData.map(submission => {
        const eventPlan = eventPlansData.find(ep => ep.id === submission.eventPlanId);
        const event = eventsData.find(e => e.id === eventPlan?.associatedEventId);

        return {
          ...submission,
          eventPlanTitle: eventPlan?.title,
          eventName: event?.name,
          eventPlan
        };
      });

      setSubmissions(enrichedSubmissions);
      setEventPlans(eventPlansData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to fetch your submissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.eventPlanTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.eventName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'late':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadSubmission = (submission: Submission) => {
    if (submission.fileUrl) {
      window.open(submission.fileUrl, '_blank');
    }
  };

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  // Get activities that require submission but haven't been submitted
  const submissionRequiredPlans = eventPlans.filter(plan => plan.planType === 'withSubmission');
  const submittedPlanIds = submissions.map(s => s.eventPlanId);
  const missedSubmissions = submissionRequiredPlans.filter(plan => 
    !submittedPlanIds.includes(plan.id) && plan.date < new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">My Submissions</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{submittedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Missed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{missedSubmissions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Missed Submissions Alert */}
      {missedSubmissions.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-orange-800">
            You have {missedSubmissions.length} missed submission(s). Check with your instructor for late submission options.
          </AlertDescription>
        </Alert>
      )}

      {/* Submissions List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your submissions...</p>
            </CardContent>
          </Card>
        ) : filteredSubmissions.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No Submissions Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No submissions match your search.' : 'You haven\'t made any submissions yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-black">{submission.eventPlanTitle}</CardTitle>
                        <CardDescription>{submission.eventName}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(submission.status)}
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {submission.submittedAt.toLocaleDateString()} at {submission.submittedAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {submission.submissionType}
                      </Badge>
                      {submission.fileName && (
                        <span className="text-xs text-gray-500">
                          {submission.fileName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {submission.submissionType === 'file' && submission.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSubmission(submission)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white">
                        <DialogHeader>
                          <DialogTitle className="text-black">{submission.eventPlanTitle}</DialogTitle>
                          <DialogDescription>
                            {submission.eventName} • Submitted on {submission.submittedAt.toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-black">Status:</span>
                              <Badge className={`ml-2 ${getStatusColor(submission.status)}`}>
                                {submission.status}
                              </Badge>
                            </div>
                            <div>
                              <span className="font-medium text-black">Type:</span>
                              <span className="ml-2 text-black">{submission.submissionType}</span>
                            </div>
                            <div>
                              <span className="font-medium text-black">Submitted:</span>
                              <span className="ml-2 text-black">{submission.submittedAt.toLocaleString()}</span>
                            </div>
                            {submission.fileName && (
                              <div>
                                <span className="font-medium text-black">File:</span>
                                <span className="ml-2 text-black">{submission.fileName}</span>
                              </div>
                            )}
                          </div>
                          {submission.eventPlan?.description && (
                            <div>
                              <span className="font-medium text-black">Activity Description:</span>
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-black">{submission.eventPlan.description}</p>
                              </div>
                            </div>
                          )}
                          {submission.content && (
                            <div>
                              <span className="font-medium text-black">Your Response:</span>
                              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-black">{submission.content}</p>
                              </div>
                            </div>
                          )}
                          {submission.fileUrl && (
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => handleDownloadSubmission(submission)}
                                className="w-full"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Your File
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Missed Submissions Section */}
      {missedSubmissions.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Missed Submissions</span>
            </CardTitle>
            <CardDescription>
              Activities that required submission but were not completed on time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {missedSubmissions.map((plan) => {
                const event = events.find(e => e.id === plan.associatedEventId);
                return (
                  <div key={plan.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-900">{plan.title}</h4>
                      <p className="text-sm text-red-700">
                        {event?.name} • Due: {plan.date.toLocaleDateString()} at {plan.time}
                      </p>
                    </div>
                    <Badge variant="destructive">Missed</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};