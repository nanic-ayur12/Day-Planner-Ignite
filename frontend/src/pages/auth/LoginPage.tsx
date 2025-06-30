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

    if (rateLimited) {
      setError('Please wait a few minutes before attempting to login again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(studentCredentials.rollNumber, studentCredentials.password, true);
      toast({
        title: "Welcome back!",
        description: "Successfully logged into your student dashboard",
        variant: "success",
      });
      setAttemptCount(0);
      setRateLimited(false);
      navigate('/student');
    } catch (error) {
      console.error('Login error:', error);
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      if (newAttemptCount >= 3 && !rateLimited) {
        toast({
          title: "Security Notice",
          description: "Multiple failed attempts detected. Please verify your credentials.",
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

    if (rateLimited) {
      setError('Please wait a few minutes before attempting to login again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(adminCredentials.email, adminCredentials.password, false);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the administrative dashboard",
        variant: "success",
      });
      setAttemptCount(0);
      setRateLimited(false);
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      if (newAttemptCount >= 3 && !rateLimited) {
        toast({
          title: "Security Alert",
          description: "Multiple failed admin login attempts detected.",
          variant: "warning",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Left side - Enhanced Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
        </div>
        
        <div className="relative z-10 max-w-lg text-center space-y-8">
          <div className="flex items-center justify-center">
            <div className="p-8 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
              <Activity className="h-20 w-20 text-white" />
            </div>
          </div>
          <div className="space-y-6">
            <h1 className="text-6xl font-bold text-white leading-tight">
              Ignite
              <span className="block text-4xl font-light text-blue-100">Student Portal</span>
            </h1>
            <div className="space-y-3">
              <p className="text-2xl text-blue-100 font-medium">Kumaraguru Institutions</p>
              <p className="text-lg text-blue-200 leading-relaxed max-w-md mx-auto">
                Empowering education through seamless digital experiences
              </p>
            </div>
          </div>
          <div className="pt-8">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-white font-medium">Secure & Reliable Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Enhanced Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl">
                <Activity className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Ignite Portal
              </h1>
              <p className="text-blue-600 font-medium">Kumaraguru Institutions</p>
            </div>
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          {/* Enhanced Rate limit warning */}
          {rateLimited && (
            <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-800 font-medium">
                <div className="space-y-1">
                  <p className="font-semibold">Account Temporarily Locked</p>
                  <p className="text-sm">Multiple failed attempts detected. Please wait 5-10 minutes before trying again.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">Account Access</CardTitle>
              <CardDescription className="text-gray-600">
                Choose your role to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1.5 rounded-xl h-14 shadow-inner">
                  <TabsTrigger 
                    value="student" 
                    className="flex items-center justify-center space-x-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200 rounded-lg transition-all h-11 focus:outline-none focus:ring-0 focus-visible:ring-0"
                  >
                    <GraduationCap className="h-5 w-5" />
                    <span className="font-semibold text-gray-900">Student</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin" 
                    className="flex items-center justify-center space-x-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200 rounded-lg transition-all h-11 focus:outline-none focus:ring-0 focus-visible:ring-0"
                  >
                    <Shield className="h-5 w-5" />
                    <span className="font-semibold text-gray-900">Admin</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="student" className="mt-8">
                  <form onSubmit={handleStudentLogin} className="space-y-6">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="rollNumber" className="text-sm font-semibold text-gray-700">
                          Roll Number
                        </Label>
                        <Input
                          id="rollNumber"
                          type="text"
                          placeholder="Enter your roll number"
                          value={studentCredentials.rollNumber}
                          onChange={(e) => setStudentCredentials(prev => ({ ...prev, rollNumber: e.target.value }))}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm shadow-sm"
                          disabled={rateLimited}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentPassword" className="text-sm font-semibold text-gray-700">
                          Password
                        </Label>
                        <Input
                          id="studentPassword"
                          type="password"
                          placeholder="Enter your password"
                          value={studentCredentials.password}
                          onChange={(e) => setStudentCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm shadow-sm"
                          disabled={rateLimited}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button 
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group focus:outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={loading || rateLimited}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-3" />
                            Signing in...
                          </>
                        ) : rateLimited ? (
                          <>
                            <AlertTriangle className="h-5 w-5 mr-3" />
                            Account Locked
                          </>
                        ) : (
                          <>
                            <GraduationCap className="h-5 w-5 mr-3" />
                            Sign in as Student
                            <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="admin" className="mt-8">
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={adminCredentials.email}
                          onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                          className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl text-sm shadow-sm"
                          disabled={rateLimited}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminPassword" className="text-sm font-semibold text-gray-700">
                          Password
                        </Label>
                        <Input
                          id="adminPassword"
                          type="password"
                          placeholder="Enter your password"
                          value={adminCredentials.password}
                          onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl text-sm shadow-sm"
                          disabled={rateLimited}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button 
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group focus:outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={loading || rateLimited}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-3" />
                            Signing in...
                          </>
                        ) : rateLimited ? (
                          <>
                            <AlertTriangle className="h-5 w-5 mr-3" />
                            Account Locked
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5 mr-3" />
                            Sign in as Admin
                            <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>

              {error && (
                <Alert className={`rounded-xl shadow-lg ${rateLimited ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50' : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'}`}>
                  {rateLimited && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                  <AlertDescription className={`font-medium ${rateLimited ? 'text-amber-800' : 'text-red-800'}`}>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {attemptCount >= 2 && !rateLimited && (
                <Alert className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 font-medium">
                    <div className="space-y-1">
                      <p className="font-semibold">Security Warning</p>
                      <p className="text-sm">
                        {attemptCount === 2 ? 'One more failed attempt may temporarily lock your account.' : 
                         'Multiple failed attempts detected. Please verify your credentials carefully.'}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              © 2025 Kumaraguru Institutions. All rights reserved.
            </p>
            <p className="text-xs text-gray-400">
              Secured with enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};