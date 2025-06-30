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
  Send
} from 'lucide-react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { EventPlan, Submission } from '@/types';
import { useToast } from '@/hooks/use-toast';

const getTimePhase = () => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 0 && hour < 9) return 'preview';
  if (hour >= 9 && hour < 24) return 'active';
  return 'review';
};

const getActivityStatus = (activity: EventPlan, currentTime: Date) => {
  const activityTime = new Date(activity.date);
  const [time, period] = activity.time.split(' ');
  const [hours, minutes] = time.split(':');
  
  let hour24 = parseInt(hours);
  if (period === 'PM' && hour24 !== 12) hour24 += 12;
  if (period === 'AM' && hour24 === 12) hour24 = 0;
  
  activityTime.setHours(hour24, parseInt(minutes), 0, 0);
  
  const endOfDay = new Date(activity.date);
  endOfDay.setHours(23, 59, 59, 999);
  
  if (currentTime < activityTime) return 'upcoming';
  if (currentTime >= activityTime && currentTime <= endOfDay) return 'ongoing';
  return 'completed';
};

// Helper function to get current date in IST
const getCurrentDateIST = () => {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().split('T')[0];
};

export const DayActivities: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getCurrentDateIST());
  const [timePhase, setTimePhase] = useState(getTimePhase());
  const [eventPlans, setEventPlans] = useState<EventPlan[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionData, setSubmissionData] = useState<{[key: string]: any}>({});
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setTimePhase(getTimePhase());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (userProfile?.id) {
      fetchTodayActivities();
      fetchUserSubmissions();
    }
  }, [userProfile, selectedDate]);

  const fetchTodayActivities = async () => {
    try {
      const today = new Date(selectedDate);
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const eventPlansSnapshot = await getDocs(collection(db, 'eventPlans'));
      const plansData = eventPlansSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate()
        })) as EventPlan[];

      const todayPlans = plansData.filter(plan => {
        const planDate = plan.date.toDateString();
        const selectedDateObj = new Date(selectedDate).toDateString();
        return planDate === selectedDateObj;
      });

      setEventPlans(todayPlans);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load today's activities",
        variant: "destructive",
      });
    }
  };

  const fetchUserSubmissions = async () => {
    if (!userProfile?.id) return;
    
    try {
      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('studentId', '==', userProfile.id)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissionsData = submissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt.toDate()
      })) as Submission[];

      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleFileUpload = async (activityId: string, file: File) => {
    if (!file || !userProfile?.id) return;

    // Get the file size limit from the activity or default to 5MB
    const activity = eventPlans.find(plan => plan.id === activityId);
    const maxSizeInMB = activity?.fileSizeLimit || 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    // Check file size
    if (file.size > maxSizeInBytes) {
      toast({
        title: "File too large",
        description: `File size exceeds ${maxSizeInMB}MB limit`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploadProgress(prev => ({ ...prev, [activityId]: 0 }));
    
    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `submissions/${userProfile.id}/${activityId}/${file.name}`);
      
      // Simulate progress for better UX
      for (let progress = 0; progress <= 90; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [activityId]: progress }));
      }

      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      setUploadProgress(prev => ({ ...prev, [activityId]: 100 }));

      // Save submission to Firestore
      const submissionData = {
        studentId: userProfile.id,
        eventPlanId: activityId,
        submissionType: 'file' as const,
        fileUrl: downloadURL,
        fileName: file.name,
        fileSize: file.size,
        submittedAt: new Date(),
        status: 'submitted' as const
      };

      await addDoc(collection(db, 'submissions'), submissionData);

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

      toast({
        title: "Success!",
        description: "File uploaded and submitted successfully",
      });

      fetchUserSubmissions();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[activityId];
        return newProgress;
      });
    }
  };

  const handleTextSubmission = async (activityId: string, text: string) => {
    if (!text.trim() || !userProfile?.id) return;

    setLoading(true);
    try {
      const submissionData = {
        studentId: userProfile.id,
        eventPlanId: activityId,
        submissionType: 'text' as const,
        content: text,
        submittedAt: new Date(),
        status: 'submitted' as const
      };

      await addDoc(collection(db, 'submissions'), submissionData);

      setSubmissionData(prev => ({
        ...prev,
        [activityId]: {
          type: 'text',
          content: text,
          submittedAt: new Date(),
          status: 'submitted'
        }
      }));

      toast({
        title: "Success!",
        description: "Text submission saved successfully",
      });

      fetchUserSubmissions();
    } catch (error) {
      console.error('Error submitting text:', error);
      toast({
        title: "Error",
        description: "Failed to submit text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkSubmission = async (activityId: string, link: string) => {
    if (!link.trim() || !userProfile?.id) return;

    setLoading(true);
    try {
      const submissionData = {
        studentId: userProfile.id,
        eventPlanId: activityId,
        submissionType: 'link' as const,
        content: link,
        submittedAt: new Date(),
        status: 'submitted' as const
      };

      await addDoc(collection(db, 'submissions'), submissionData);

      setSubmissionData(prev => ({
        ...prev,
        [activityId]: {
          type: 'link',
          content: link,
          submittedAt: new Date(),
          status: 'submitted'
        }
      }));

      toast({
        title: "Success!",
        description: "Link submission saved successfully",
      });

      fetchUserSubmissions();
    } catch (error) {
      console.error('Error submitting link:', error);
      toast({
        title: "Error",
        description: "Failed to submit link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPhaseIcon = () => {
    switch (timePhase) {
      case 'preview':
        return <Sunrise className="h-5 w-5 text-orange-600" />;
      case 'active':
        return <Sun className="h-5 w-5 text-blue-600" />;
      case 'review':
        return <Moon className="h-5 w-5 text-purple-600" />;
    }
  };

  const renderPhaseMessage = () => {
    switch (timePhase) {
      case 'preview':
        return 'Good morning! Here\'s a preview of today\'s activities';
      case 'active':
        return 'Activities are active. You can submit work until 11:59 PM today!';
      case 'review':
        return 'Day completed! Review today\'s activities and catch up on submissions';
    }
  };

  const getVisibleActivities = () => {
    return eventPlans;
  };

  const isSubmitted = (activityId: string) => {
    return submissions.some(sub => sub.eventPlanId === activityId) || submissionData[activityId];
  };

  const canSubmit = (activity: EventPlan) => {
    const now = new Date();
    const activityDate = new Date(activity.date);
    const endOfDay = new Date(activityDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    return now <= endOfDay && !isSubmitted(activity.id);
  };

  const renderSubmissionInterface = (activity: EventPlan) => {
    const submission = submissionData[activity.id] || submissions.find(sub => sub.eventPlanId === activity.id);
    const progress = uploadProgress[activity.id];
    const submitted = isSubmitted(activity.id);
    const submissionAllowed = canSubmit(activity);

    if (submitted) {
      return (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Submitted Successfully</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {submission?.submissionType === 'file' 
              ? `File: ${submission.fileName || 'File uploaded'}`
              : submission?.submissionType === 'text'
              ? `Text: ${submission.content?.substring(0, 50)}...`
              : `Link: ${submission.content}`
            }
          </p>
          <p className="text-xs text-green-600 mt-1">
            Submitted at: {(submission?.submittedAt || new Date()).toLocaleString()}
          </p>
        </div>
      );
    }

    if (!submissionAllowed) {
      return (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-gray-600" />
            <span className="text-gray-800 font-medium">Submission Period Ended</span>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            Submissions were due by 11:59 PM on {activity.date.toLocaleDateString()}
          </p>
        </div>
      );
    }

    if (activity.submissionType === 'file') {
      const maxSizeInMB = activity.fileSizeLimit || 5;
      
      return (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor={`file-${activity.id}`} className="text-sm font-medium text-black">
              Upload File (Max: {maxSizeInMB}MB)
            </Label>
            <Input
              id={`file-${activity.id}`}
              type="file"
              className="mt-1 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
                  if (file.size > maxSizeInBytes) {
                    toast({
                      title: "File too large",
                      description: `File size exceeds ${maxSizeInMB}MB limit`,
                      variant: "destructive",
                    });
                    return;
                  }
                  handleFileUpload(activity.id, file);
                }
              }}
              disabled={progress !== undefined || loading}
            />
          </div>
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-black">Uploading...</span>
                <span className="text-black">{progress}%</span>
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
            <Label htmlFor={`text-${activity.id}`} className="text-sm font-medium text-black">
              Your Response
            </Label>
            <Textarea
              id={`text-${activity.id}`}
              placeholder="Enter your response here..."
              rows={4}
              className="mt-1 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={() => {
              const textarea = document.getElementById(`text-${activity.id}`) as HTMLTextAreaElement;
              if (textarea?.value.trim()) {
                handleTextSubmission(activity.id, textarea.value);
              }
            }}
            disabled={loading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Submitting...' : 'Submit Response'}
          </Button>
        </div>
      );
    }

    if (activity.submissionType === 'link') {
      return (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor={`link-${activity.id}`} className="text-sm font-medium text-black">
              Submit Link
            </Label>
            <Input
              id={`link-${activity.id}`}
              type="url"
              placeholder="Enter URL here..."
              className="mt-1 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={() => {
              const input = document.getElementById(`link-${activity.id}`) as HTMLInputElement;
              if (input?.value.trim()) {
                handleLinkSubmission(activity.id, input.value);
              }
            }}
            disabled={loading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Submitting...' : 'Submit Link'}
          </Button>
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
          <h1 className="text-3xl font-bold text-black">Today's Activities</h1>
          <div className="flex items-center space-x-2">
            {renderPhaseIcon()}
            <Badge variant="secondary" className="text-sm bg-gray-100 text-black">
              {timePhase === 'preview' ? 'Preview Mode' : 
               timePhase === 'active' ? 'Active Mode' : 
               'Review Mode'}
            </Badge>
          </div>
        </div>
        
        <Alert className="border border-blue-200 bg-blue-50">
          <div className="flex items-center justify-left space-x-2">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-blue-800 text-center">
              {renderPhaseMessage()} • Current time: {currentTime.toLocaleTimeString()}
            </AlertDescription>
          </div>
        </Alert>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid gap-6">
        {visibleActivities.length === 0 ? (
          <Card className="border border-gray-200 p-8 text-center">
            <CardContent>
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No Activities Today</h3>
              <p className="text-gray-600">Check back later or select a different date.</p>
            </CardContent>
          </Card>
        ) : (
          visibleActivities.map((activity) => {
            const status = getActivityStatus(activity, currentTime);
            const submitted = isSubmitted(activity.id);
            
            return (
              <Card key={activity.id} className={`border transition-all duration-300 hover:shadow-md ${
                status === 'ongoing' ? 'border-blue-500 bg-blue-50' :
                status === 'completed' ? 'border-green-500 bg-green-50' : 
                'border-gray-200 hover:border-gray-300'
              }`}>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <CardTitle className="text-lg text-black">{activity.title}</CardTitle>
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
                        {submitted && (
                          <Badge variant="success" className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Submitted
                          </Badge>
                        )}
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
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {timePhase === 'review' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border border-gray-300 hover:bg-gray-50">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white">
                          <DialogHeader>
                            <DialogTitle className="text-black">{activity.title}</DialogTitle>
                            <DialogDescription className="text-gray-600">{activity.time} - {activity.endTime}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-black">{activity.description}</p>
                            {activity.planType === 'withSubmission' && renderSubmissionInterface(activity)}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  
                  {timePhase !== 'preview' && (
                    <CardDescription className="text-base text-black">
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
      <div className="text-center text-sm text-gray-600 space-y-2 p-4 bg-white rounded-lg border border-gray-200">
        <p>
          {timePhase === 'preview' && 'Full activity details will be available from 9:00 AM'}
          {timePhase === 'active' && 'You can submit your work for any activity until 11:59 PM today'}
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