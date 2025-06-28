import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Calendar,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  Sunrise,
  Sun,
  Moon,
  Link as LinkIcon
} from 'lucide-react';

// Mock data for demonstration
const todayActivities = [
  {
    id: '1',
    title: 'Morning Assembly',
    description: 'Welcome session for all freshers with college introduction and brigade formation',
    time: '09:00 AM',
    planType: 'withoutSubmission',
    status: 'completed',
    endTime: '10:00 AM'
  },
  {
    id: '2',
    title: 'Ice Breaker Activities',
    description: 'Fun activities to help students get to know each other within their brigades',
    time: '10:30 AM',
    planType: 'withSubmission',
    submissionType: 'file',
    fileSizeLimit: 5,
    status: 'ongoing',
    endTime: '12:00 PM'
  },
  {
    id: '3',
    title: 'Leadership Workshop',
    description: 'Interactive workshop on leadership skills and team building exercises',
    time: '02:00 PM',
    planType: 'withSubmission',
    submissionType: 'text',
    status: 'upcoming',
    endTime: '04:00 PM'
  },
  {
    id: '4',
    title: 'Cultural Performance',
    description: 'Showcase of talents and cultural performances by students',
    time: '04:30 PM',
    planType: 'withoutSubmission',
    status: 'upcoming',
    endTime: '06:00 PM'
  }
];

const getTimePhase = () => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 0 && hour < 9) return 'preview';
  if (hour >= 9 && hour < 18) return 'active';
  return 'review';
};

const getActivityStatus = (activity: any, currentTime: Date) => {
  const activityTime = new Date();
  const [time, period] = activity.time.split(' ');
  const [hours, minutes] = time.split(':');
  
  let hour24 = parseInt(hours);
  if (period === 'PM' && hour24 !== 12) hour24 += 12;
  if (period === 'AM' && hour24 === 12) hour24 = 0;
  
  activityTime.setHours(hour24, parseInt(minutes), 0, 0);
  
  const endTime = new Date();
  const [endTimeStr, endPeriod] = activity.endTime.split(' ');
  const [endHours, endMinutes] = endTimeStr.split(':');
  
  let endHour24 = parseInt(endHours);
  if (endPeriod === 'PM' && endHour24 !== 12) endHour24 += 12;
  if (endPeriod === 'AM' && endHour24 === 12) endHour24 = 0;
  
  endTime.setHours(endHour24, parseInt(endMinutes), 0, 0);
  
  if (currentTime < activityTime) return 'upcoming';
  if (currentTime >= activityTime && currentTime <= endTime) return 'ongoing';
  return 'completed';
};

export const DayActivities: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timePhase, setTimePhase] = useState(getTimePhase());
  const [submissionData, setSubmissionData] = useState<{[key: string]: any}>({});
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setTimePhase(getTimePhase());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFileUpload = async (activityId: string, file: File) => {
    if (!file) return;

    // Simulate file upload progress
    setUploadProgress(prev => ({ ...prev, [activityId]: 0 }));
    
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({ ...prev, [activityId]: progress }));
    }

    setSubmissionData(prev => ({
      ...prev,
      [activityId]: {
        type: 'file',
        fileName: file.name,
        fileSize: file.size,
        submittedAt: new Date(),
        status: 'submitted'
      }
    }));
    
    setUploadProgress(prev => ({ ...prev, [activityId]: undefined }));
  };

  const handleTextSubmission = (activityId: string, text: string) => {
    setSubmissionData(prev => ({
      ...prev,
      [activityId]: {
        type: 'text',
        content: text,
        submittedAt: new Date(),
        status: 'submitted'
      }
    }));
  };

  const renderPhaseIcon = () => {
    switch (timePhase) {
      case 'preview':
        return <Sunrise className="h-5 w-5 text-orange-600" />;
      case 'active':
        return <Sun className="h-5 w-5 text-yellow-600" />;
      case 'review':
        return <Moon className="h-5 w-5 text-blue-600" />;
    }
  };

  const renderPhaseMessage = () => {
    switch (timePhase) {
      case 'preview':
        return 'Good morning! Here\'s a preview of today\'s activities';
      case 'active':
        return 'Activities are now active. Join the ongoing sessions!';
      case 'review':
        return 'Day completed! Review today\'s activities and catch up on submissions';
    }
  };

  const getVisibleActivities = () => {
    if (timePhase === 'preview' || timePhase === 'review') {
      return todayActivities;
    }
    
    // During active phase, show only current and past activities
    return todayActivities.filter(activity => {
      const status = getActivityStatus(activity, currentTime);
      return status === 'completed' || status === 'ongoing';
    });
  };

  const renderSubmissionInterface = (activity: any) => {
    const submission = submissionData[activity.id];
    const progress = uploadProgress[activity.id];

    if (submission) {
      return (
        <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Submitted Successfully</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {submission.type === 'file' 
              ? `File: ${submission.fileName} (${(submission.fileSize / 1024 / 1024).toFixed(2)} MB)`
              : `Text submission: ${submission.content.substring(0, 50)}...`
            }
          </p>
          <p className="text-xs text-green-600 mt-1">
            Submitted at: {submission.submittedAt.toLocaleTimeString()}
          </p>
        </div>
      );
    }

    if (activity.submissionType === 'file') {
      return (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor={`file-${activity.id}`} className="text-sm font-medium text-gray-700">
              Upload File (Max: {activity.fileSizeLimit}MB)
            </Label>
            <Input
              id={`file-${activity.id}`}
              type="file"
              className="mt-1 border-2 border-gray-200 focus:border-blue-500"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > activity.fileSizeLimit * 1024 * 1024) {
                    alert(`File size exceeds ${activity.fileSizeLimit}MB limit`);
                    return;
                  }
                  handleFileUpload(activity.id, file);
                }
              }}
              disabled={progress !== undefined}
            />
          </div>
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Uploading...</span>
                <span className="text-gray-700">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </div>
      );
    }

    if (activity.submissionType === 'text') {
      return (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor={`text-${activity.id}`} className="text-sm font-medium text-gray-700">
              Your Response
            </Label>
            <Textarea
              id={`text-${activity.id}`}
              placeholder="Enter your response here..."
              rows={4}
              className="mt-1 border-2 border-gray-200 focus:border-blue-500"
              onChange={(e) => {
                if (e.target.value.trim()) {
                  setTimeout(() => handleTextSubmission(activity.id, e.target.value), 1000);
                }
              }}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const visibleActivities = getVisibleActivities();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Today's Activities</h1>
          <div className="flex items-center space-x-2">
            {renderPhaseIcon()}
            <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-800">
              {timePhase === 'preview' ? 'Preview Mode' : 
               timePhase === 'active' ? 'Active Mode' : 
               'Review Mode'}
            </Badge>
          </div>
        </div>
        
        <Alert className="border-2 border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            {renderPhaseMessage()} • Current time: {currentTime.toLocaleTimeString()}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto border-2 border-gray-200 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid gap-6">
        {visibleActivities.length === 0 ? (
          <Card className="border-2 border-gray-200 p-8 text-center">
            <CardContent>
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Today</h3>
              <p className="text-gray-600">Check back later or select a different date.</p>
            </CardContent>
          </Card>
        ) : (
          visibleActivities.map((activity) => {
            const status = getActivityStatus(activity, currentTime);
            const submission = submissionData[activity.id];
            
            return (
              <Card key={activity.id} className={`border-2 transition-all duration-300 hover:shadow-lg ${
                status === 'ongoing' ? 'border-blue-500 bg-blue-50' :
                status === 'completed' ? 'border-green-500 bg-green-50' : 
                'border-gray-200 hover:border-gray-300'
              }`}>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <CardTitle className="text-lg text-gray-900">{activity.title}</CardTitle>
                        <Badge 
                          variant="default"
                          className={
                            status === 'ongoing' ? 'bg-blue-600 text-white' :
                            status === 'completed' ? 'bg-green-600 text-white' : 
                            'bg-orange-600 text-white'
                          }
                        >
                          {status === 'ongoing' ? 'Live Now' :
                           status === 'completed' ? 'Completed' : 
                           'Upcoming'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{activity.time} - {activity.endTime}</span>
                        </div>
                        {activity.planType === 'withSubmission' && (
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>Submission Required</span>
                            {submission && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {timePhase === 'review' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-2 border-gray-200 hover:bg-gray-50">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900">{activity.title}</DialogTitle>
                            <DialogDescription className="text-gray-600">{activity.time} - {activity.endTime}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-gray-700">{activity.description}</p>
                            {activity.planType === 'withSubmission' && renderSubmissionInterface(activity)}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  
                  {timePhase !== 'preview' && (
                    <CardDescription className="text-base text-gray-700">
                      {activity.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                {timePhase !== 'preview' && activity.planType === 'withSubmission' && timePhase !== 'review' && (
                  <CardContent>
                    {renderSubmissionInterface(activity)}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-600 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p>
          {timePhase === 'preview' && 'Full activity details will be available from 9:00 AM'}
          {timePhase === 'active' && 'New activities will appear automatically as they become available'}
          {timePhase === 'review' && 'Click "View Details" to see full information and submit if you missed anything'}
        </p>
        <p className="flex items-center justify-center space-x-1">
          <span>Last updated:</span>
          <span className="font-medium">{currentTime.toLocaleTimeString()}</span>
        </p>
      </div>
    </div>
  );
};