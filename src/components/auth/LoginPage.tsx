import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Activity, GraduationCap, Shield, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [studentCredentials, setStudentCredentials] = useState({ rollNumber: '', password: '' });
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
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

  const fillDemoCredentials = (type: 'admin' | 'student') => {
    if (type === 'admin') {
      setAdminCredentials({ email: 'admin@ignite.edu', password: 'admin123' });
    } else {
      setStudentCredentials({ rollNumber: 'CS2021001', password: 'student123' });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <div className="p-4 bg-blue-100 rounded-2xl shadow-lg">
                <Activity className="h-10 w-10 text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">
                Ignite Planner
              </h1>
              <p className="text-blue-600 text-sm font-medium">Kumaraguru College</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl text-gray-900 font-semibold">Welcome Back</p>
            <p className="text-gray-600">Lead & Co-Lead Management System</p>
          </div>
        </div>

        <Card className="border shadow-lg bg-white">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
            <CardDescription className="text-gray-600">
              Choose your account type to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="student" 
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Student</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="mt-6">
                <form onSubmit={handleStudentLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber" className="text-gray-700 font-medium">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      type="text"
                      placeholder="Enter your roll number"
                      value={studentCredentials.rollNumber}
                      onChange={(e) => setStudentCredentials(prev => ({ ...prev, rollNumber: e.target.value }))}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentPassword" className="text-gray-700 font-medium">Password</Label>
                    <Input
                      id="studentPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={studentCredentials.password}
                      onChange={(e) => setStudentCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials('student')}
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
                  >
                    Use Demo Credentials
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <GraduationCap className="h-5 w-5 mr-2" />
                    )}
                    Sign in as Student
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin" className="mt-6">
                <form onSubmit={handleAdminLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={adminCredentials.email}
                      onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword" className="text-gray-700 font-medium">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl"
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials('admin')}
                    className="w-full border-green-200 text-green-600 hover:bg-green-50 rounded-xl"
                  >
                    Use Demo Credentials
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Shield className="h-5 w-5 mr-2" />
                    )}
                    Sign in as Admin
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50 rounded-xl">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          Secured with Firebase Authentication
        </div>
      </div>
    </div>
  );
};