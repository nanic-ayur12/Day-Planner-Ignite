import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  Users,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Event, EventPlan } from '@/types';

export const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventPlans, setEventPlans] = useState<EventPlan[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { userProfile } = useAuth();

  const [eventForm, setEventForm] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const [planForm, setPlanForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    planType: 'withoutSubmission' as 'withSubmission' | 'withoutSubmission',
    submissionType: 'file' as 'file' | 'text' | 'link',
    fileSizeLimit: 5
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventPlans(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
        endDate: doc.data().endDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as Event[];
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    }
  };

  const fetchEventPlans = async (eventId: string) => {
    try {
      const plansQuery = query(collection(db, 'eventPlans'), where('associatedEventId', '==', eventId));
      const plansSnapshot = await getDocs(plansQuery);
      const plansData = plansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as EventPlan[];
      setEventPlans(plansData);
    } catch (error) {
      console.error('Error fetching event plans:', error);
      setError('Failed to fetch event plans');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.startDate || !eventForm.endDate) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const eventData = {
        name: eventForm.name,
        startDate: new Date(eventForm.startDate),
        endDate: new Date(eventForm.endDate),
        createdBy: userProfile?.id || '',
        createdAt: new Date(),
        isActive: true
      };

      await addDoc(collection(db, 'events'), eventData);
      setEventForm({ name: '', startDate: '', endDate: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEventPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !planForm.title || !planForm.date || !planForm.time) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const planData = {
        title: planForm.title,
        description: planForm.description,
        date: new Date(planForm.date),
        time: planForm.time,
        endTime: planForm.endTime,
        associatedEventId: selectedEvent.id,
        planType: planForm.planType,
        ...(planForm.planType === 'withSubmission' && {
          submissionType: planForm.submissionType,
          ...(planForm.submissionType === 'file' && { fileSizeLimit: planForm.fileSizeLimit })
        }),
        createdBy: userProfile?.id || '',
        createdAt: new Date(),
        isActive: true
      };

      await addDoc(collection(db, 'eventPlans'), planData);
      setPlanForm({
        title: '',
        description: '',
        date: '',
        time: '',
        endTime: '',
        planType: 'withoutSubmission',
        submissionType: 'file',
        fileSizeLimit: 5
      });
      fetchEventPlans(selectedEvent.id);
    } catch (error) {
      console.error('Error creating event plan:', error);
      setError('Failed to create event plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also delete all associated plans.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'events', eventId));
      fetchEvents();
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
        setEventPlans([]);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    }
  };

  const handleDeleteEventPlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this event plan?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'eventPlans', planId));
      if (selectedEvent) {
        fetchEventPlans(selectedEvent.id);
      }
    } catch (error) {
      console.error('Error deleting event plan:', error);
      setError('Failed to delete event plan');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Create a new event to organize activities and plans
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  value={eventForm.name}
                  onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter event name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="plans" disabled={!selectedEvent}>
            Event Plans {selectedEvent && `(${selectedEvent.name})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4">
            {events.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Created</h3>
                  <p className="text-gray-600">Create your first event to get started.</p>
                </CardContent>
              </Card>
            ) : (
              events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow border">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{event.name}</CardTitle>
                        <CardDescription>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}</span>
                            </span>
                            <Badge variant={event.isActive ? 'default' : 'secondary'}>
                              {event.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Plans
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {selectedEvent && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Plans for {selectedEvent.name}</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Event Plan</DialogTitle>
                      <DialogDescription>
                        Create a new activity plan for {selectedEvent.name}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEventPlan} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="planTitle">Title</Label>
                        <Input
                          id="planTitle"
                          value={planForm.title}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter plan title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="planDescription">Description</Label>
                        <Textarea
                          id="planDescription"
                          value={planForm.description}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter plan description"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="planDate">Date</Label>
                          <Input
                            id="planDate"
                            type="date"
                            value={planForm.date}
                            onChange={(e) => setPlanForm(prev => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="planTime">Start Time</Label>
                          <Input
                            id="planTime"
                            type="time"
                            value={planForm.time}
                            onChange={(e) => setPlanForm(prev => ({ ...prev, time: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="planEndTime">End Time</Label>
                          <Input
                            id="planEndTime"
                            type="time"
                            value={planForm.endTime}
                            onChange={(e) => setPlanForm(prev => ({ ...prev, endTime: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Plan Type</Label>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="withoutSubmission"
                                checked={planForm.planType === 'withoutSubmission'}
                                onChange={(e) => setPlanForm(prev => ({ ...prev, planType: e.target.value as any }))}
                              />
                              <span>Without Submission</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="withSubmission"
                                checked={planForm.planType === 'withSubmission'}
                                onChange={(e) => setPlanForm(prev => ({ ...prev, planType: e.target.value as any }))}
                              />
                              <span>With Submission</span>
                            </label>
                          </div>
                        </div>
                        {planForm.planType === 'withSubmission' && (
                          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <div className="space-y-2">
                              <Label>Submission Type</Label>
                              <div className="flex space-x-4">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    value="file"
                                    checked={planForm.submissionType === 'file'}
                                    onChange={(e) => setPlanForm(prev => ({ ...prev, submissionType: e.target.value as any }))}
                                  />
                                  <span>File Upload</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    value="text"
                                    checked={planForm.submissionType === 'text'}
                                    onChange={(e) => setPlanForm(prev => ({ ...prev, submissionType: e.target.value as any }))}
                                  />
                                  <span>Text Response</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    value="link"
                                    checked={planForm.submissionType === 'link'}
                                    onChange={(e) => setPlanForm(prev => ({ ...prev, submissionType: e.target.value as any }))}
                                  />
                                  <span>Link</span>
                                </label>
                              </div>
                            </div>
                            {planForm.submissionType === 'file' && (
                              <div className="space-y-2">
                                <Label htmlFor="fileSizeLimit">File Size Limit (MB)</Label>
                                <Input
                                  id="fileSizeLimit"
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={planForm.fileSizeLimit}
                                  onChange={(e) => setPlanForm(prev => ({ ...prev, fileSizeLimit: parseInt(e.target.value) }))}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Creating...' : 'Create Plan'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {eventPlans.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CardContent>
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Created</h3>
                      <p className="text-gray-600">Create your first event plan to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  eventPlans.map((plan) => (
                    <Card key={plan.id} className="hover:shadow-md transition-shadow border">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2">
                            <CardTitle className="text-lg">{plan.title}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{plan.date.toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{plan.time} - {plan.endTime}</span>
                              </span>
                              <Badge variant={plan.planType === 'withSubmission' ? 'default' : 'secondary'}>
                                {plan.planType === 'withSubmission' ? 'With Submission' : 'No Submission'}
                              </Badge>
                              {plan.planType === 'withSubmission' && (
                                <Badge variant="outline">
                                  {plan.submissionType}
                                  {plan.submissionType === 'file' && ` (${plan.fileSizeLimit}MB)`}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEventPlan(plan.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};