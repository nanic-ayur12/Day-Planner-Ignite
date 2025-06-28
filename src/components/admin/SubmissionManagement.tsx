import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Submission, User as UserType, EventPlan, Event } from '@/types';

export const SubmissionManagement: React.FC = () => {
  const [submissions, setSubmissions] = useState<(Submission & { 
    studentName?: string; 
    eventPlanTitle?: string; 
    eventName?: string;
  })[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [eventPlans, setEventPlans] = useState<EventPlan[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'ALL',
    eventId: 'ALL',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all required data
      const [submissionsSnapshot, usersSnapshot, eventPlansSnapshot, eventsSnapshot] = await Promise.all([
        getDocs(collection(db, 'submissions')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'eventPlans')),
        getDocs(collection(db, 'events'))
      ]);

      const submissionsData = submissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt.toDate()
      })) as Submission[];

      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as UserType[];

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
        const student = usersData.find(u => u.id === submission.studentId);
        const eventPlan = eventPlansData.find(ep => ep.id === submission.eventPlanId);
        const event = eventsData.find(e => e.id === eventPlan?.associatedEventId);

        return {
          ...submission,
          studentName: student?.name,
          eventPlanTitle: eventPlan?.title,
          eventName: event?.name
        };
      });

      setSubmissions(enrichedSubmissions);
      setUsers(usersData);
      setEventPlans(eventPlansData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch submissions data');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.studentName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         submission.eventPlanTitle?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         submission.eventName?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'ALL' || submission.status === filters.status;
    
    const eventPlan = eventPlans.find(ep => ep.id === submission.eventPlanId);
    const matchesEvent = filters.eventId === 'ALL' || eventPlan?.associatedEventId === filters.eventId;
    
    const submissionDate = submission.submittedAt.toISOString().split('T')[0];
    const matchesDateFrom = !filters.dateFrom || submissionDate >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || submissionDate <= filters.dateTo;

    return matchesSearch && matchesStatus && matchesEvent && matchesDateFrom && matchesDateTo;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
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
        return 'bg-yellow-100 text-yellow-800';
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

  const exportSubmissions = () => {
    const csvContent = [
      ['Student Name', 'Event', 'Activity', 'Submission Type', 'Status', 'Submitted At'],
      ...filteredSubmissions.map(submission => [
        submission.studentName || '',
        submission.eventName || '',
        submission.eventPlanTitle || '',
        submission.submissionType,
        submission.status,
        submission.submittedAt.toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'submissions_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Submission Management</h1>
        <Button onClick={exportSubmissions} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search submissions..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.eventId} onValueChange={(value) => setFilters(prev => ({ ...prev, eventId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Events</SelectItem>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="From Date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
            <Input
              type="date"
              placeholder="To Date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSubmissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredSubmissions.filter(s => s.status === 'submitted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredSubmissions.filter(s => s.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredSubmissions.filter(s => s.status === 'late').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading submissions...</p>
            </CardContent>
          </Card>
        ) : filteredSubmissions.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Found</h3>
              <p className="text-gray-600">No submissions match your current filters.</p>
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
                        <CardTitle className="text-lg">{submission.eventPlanTitle}</CardTitle>
                        <CardDescription>
                          {submission.eventName} • {submission.studentName}
                        </CardDescription>
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
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{submission.eventPlanTitle}</DialogTitle>
                          <DialogDescription>
                            Submission by {submission.studentName} • {submission.eventName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Status:</span>
                              <Badge className={`ml-2 ${getStatusColor(submission.status)}`}>
                                {submission.status}
                              </Badge>
                            </div>
                            <div>
                              <span className="font-medium">Type:</span>
                              <span className="ml-2">{submission.submissionType}</span>
                            </div>
                            <div>
                              <span className="font-medium">Submitted:</span>
                              <span className="ml-2">{submission.submittedAt.toLocaleString()}</span>
                            </div>
                            {submission.fileName && (
                              <div>
                                <span className="font-medium">File:</span>
                                <span className="ml-2">{submission.fileName}</span>
                              </div>
                            )}
                          </div>
                          {submission.content && (
                            <div>
                              <span className="font-medium">Content:</span>
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm">{submission.content}</p>
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
                                Download File
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
    </div>
  );
};