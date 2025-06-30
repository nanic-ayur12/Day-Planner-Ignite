import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Activity, GraduationCap, Shield, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [studentCredentials, setStudentCredentials] = useState({ rollNumber: '', password: '' });
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getErrorMessage = (error: any) => {
    const errorCode = error?.code || '';
    
    switch (errorCode) {
      case 'auth/too-many-requests':
        setRateLimited(true);
        return 'Too many failed login attempts. Please wait a few minutes before trying again.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your login details and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      default:
        return 'Login failed. Please check your credentials and try again.';
    }
  };

  const handleStudentLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!studentCredentials.rollNumber || !studentCredentials.password) {
      setError('Please fill in all fields');
      return;
    }

    // Prevent further attempts if rate limited
    if (rateLimited) {
      setError('Please wait a few minutes before attempting to login again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(studentCredentials.rollNumber, studentCredentials.password, true);
      toast({
        title: "Login Successful!",
        description: "Welcome to your student dashboard",
        variant: "success",
      });
      // Reset attempt count on successful login
      setAttemptCount(0);
      setRateLimited(false);
      navigate('/student');
    } catch (error) {
      console.error('Login error:', error);
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      // Show warning after 3 failed attempts
      if (newAttemptCount >= 3 && !rateLimited) {
        toast({
          title: "Multiple Failed Attempts",
          description: "Please double-check your credentials to avoid temporary lockout.",
          variant: "warning",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!adminCredentials.email || !adminCredentials.password) {
      setError('Please fill in all fields');
      return;
    }

    // Prevent further attempts if rate limited
    if (rateLimited) {
      setError('Please wait a few minutes before attempting to login again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(adminCredentials.email, adminCredentials.password, false);
      toast({
        title: "Login Successful!",
        description: "Welcome to your admin dashboard",
        variant: "success",
      });
      // Reset attempt count on successful login
      setAttemptCount(0);
      setRateLimited(false);
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      // Show warning after 3 failed attempts
      if (newAttemptCount >= 3 && !rateLimited) {
        toast({
          title: "Multiple Failed Attempts",
          description: "Please double-check your credentials to avoid temporary lockout.",
          variant: "warning",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-50 opacity-30"></div>
        <div className="relative z-10 max-w-lg text-center space-y-8">
          <div className="flex items-center justify-center">
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <Activity className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-black leading-tight">
              Student Ignite Portal
            </h1>
            <div className="space-y-2">
              <p className="text-xl text-blue-600 font-semibold">Kumaraguru Institutions</p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Streamlined Student Access System
              </p>
            </div>
          </div>
          <div className="pt-8">
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">Secured with Firebase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                <Activity className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Student Ignite Portal</h1>
              <p className="text-blue-600 font-medium">Kumaraguru Institutions</p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-black">Welcome !!</h2>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          {/* Rate limit warning */}
          {rateLimited && (
            <Alert className="border-amber-200 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 text-sm font-medium">
                Account temporarily locked due to multiple failed attempts. Please wait 5-10 minutes before trying again.
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="space-y-1 text-center pb-6">
              <CardTitle className="text-xl font-semibold text-black">Account Access</CardTitle>
              <CardDescription className="text-gray-500">
                Select your role to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 rounded-lg h-12">
                  <TabsTrigger 
                    value="student" 
                    className="flex items-center justify-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 rounded-md transition-all h-10 focus:outline-none focus:ring-0 focus-visible:ring-0"
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-medium text-black">Student</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin" 
                    className="flex items-center justify-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 rounded-md transition-all h-10 focus:outline-none focus:ring-0 focus-visible:ring-0"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="font-medium text-black">Admin</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="student" className="mt-6">
                  <form onSubmit={handleStudentLogin} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rollNumber" className="text-sm font-medium text-black">
                          Roll Number
                        </Label>
                        <Input
                          id="rollNumber"
                          type="text"
                          placeholder="Enter your roll number"
                          value={studentCredentials.rollNumber}
                          onChange={(e) => setStudentCredentials(prev => ({ ...prev, rollNumber: e.target.value }))}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-0 focus-visible:ring-0 rounded-lg text-sm"
                          disabled={rateLimited}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentPassword" className="text-sm font-medium text-black">
                          Password
                        </Label>
                        <Input
                          id="studentPassword"
                          type="password"
                          placeholder="Enter your password"
                          value={studentCredentials.password}
                          onChange={(e) => setStudentCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-0 focus-visible:ring-0 rounded-lg text-sm"
                          disabled={rateLimited}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button 
                        type="submit"
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl group focus:outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || rateLimited}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Signing in...
                          </>
                        ) : rateLimited ? (
                          <>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Please wait...
                          </>
                        ) : (
                          <>
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Sign in as Student
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="admin" className="mt-6">
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-black">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={adminCredentials.email}
                          onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                          className="h-12 border-gray-200 focus:border-green-500 focus:ring-0 focus-visible:ring-0 rounded-lg text-sm"
                          disabled={rateLimited}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminPassword" className="text-sm font-medium text-black">
                          Password
                        </Label>
                        <Input
                          id="adminPassword"
                          type="password"
                          placeholder="Enter your password"
                          value={adminCredentials.password}
                          onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12 border-gray-200 focus:border-green-500 focus:ring-0 focus-visible:ring-0 rounded-lg text-sm"
                          disabled={rateLimited}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button 
                        type="submit"
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl group focus:outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || rateLimited}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Signing in...
                          </>
                        ) : rateLimited ? (
                          <>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Please wait...
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-2" />
                            Sign in as Admin
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>

              {error && (
                <Alert className={`rounded-lg ${rateLimited ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
                  {rateLimited && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                  <AlertDescription className={`text-sm font-medium ${rateLimited ? 'text-amber-700' : 'text-red-700'}`}>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {attemptCount >= 2 && !rateLimited && (
                <Alert className="border-yellow-200 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700 text-sm">
                    {attemptCount === 2 ? 'One more failed attempt may temporarily lock your account.' : 
                     'Multiple failed attempts detected. Please verify your credentials carefully.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              © 2025 Kumaraguru Institutions. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};