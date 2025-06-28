import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Activity, GraduationCap, Shield, Info } from 'lucide-react';
import { seedDatabase } from '@/lib/seedData';

export const LoginPage: React.FC = () => {
  const [studentCredentials, setStudentCredentials] = useState({ rollNumber: '', password: '' });
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCredentials.rollNumber || !studentCredentials.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(studentCredentials.rollNumber, studentCredentials.password, true);
      navigate('/student');
    } catch (error) {
      setError('Invalid roll number or password');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCredentials.email || !adminCredentials.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(adminCredentials.email, adminCredentials.password, false);
      navigate('/admin');
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setError('');
    
    try {
      await seedDatabase();
      setError('');
      alert('Database seeded successfully! You can now use the demo credentials.');
    } catch (error) {
      console.error('Seeding error:', error);
      setError('Database seeding failed. Please try again.');
    } finally {
      setSeeding(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'student') => {
    if (type === 'admin') {
      setAdminCredentials({ email: 'admin@ignite.edu', password: 'admin123' });
    } else {
      setStudentCredentials({ rollNumber: 'CS2021001', password: 'student123' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                Ignite Day Planner
              </h1>
              <p className="text-sm text-gray-600">Kumaraguru College</p>
            </div>
          </div>
          <p className="text-gray-600">Lead & Co-Lead Management System</p>
        </div>

        {/* Demo Credentials Info */}
        <Card className="border border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2 text-blue-900">
              <Info className="h-4 w-4" />
              <span>Demo Credentials</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-semibold text-blue-900">Admin Login:</p>
                <p className="text-blue-800">admin@ignite.edu</p>
                <p className="text-blue-800">admin123</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-blue-900">Student Login:</p>
                <p className="text-blue-800">CS2021001</p>
                <p className="text-blue-800">student123</p>
              </div>
            </div>
            <Button 
              onClick={handleSeedDatabase}
              disabled={seeding}
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {seeding ? 'Seeding Database...' : 'Initialize Demo Data'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-lg bg-white">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="student" className="flex items-center space-x-2 data-[state=active]:bg-white">
                  <GraduationCap className="h-4 w-4" />
                  <span>Student</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2 data-[state=active]:bg-white">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="mt-6">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber" className="text-gray-700">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      type="text"
                      placeholder="Enter your roll number"
                      value={studentCredentials.rollNumber}
                      onChange={(e) => setStudentCredentials(prev => ({ ...prev, rollNumber: e.target.value }))}
                      className="h-11 border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentPassword" className="text-gray-700">Password</Label>
                    <Input
                      id="studentPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={studentCredentials.password}
                      onChange={(e) => setStudentCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="h-11 border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials('student')}
                    className="w-full border border-gray-300 hover:bg-gray-50"
                  >
                    Fill Demo Credentials
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <GraduationCap className="h-4 w-4 mr-2" />
                    )}
                    Sign in as Student
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin" className="mt-6">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={adminCredentials.email}
                      onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="h-11 border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword" className="text-gray-700">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="h-11 border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials('admin')}
                    className="w-full border border-gray-300 hover:bg-gray-50"
                  >
                    Fill Demo Credentials
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Sign in as Admin
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4 border border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          Protected by Firebase Authentication
        </div>
      </div>
    </div>
  );
};