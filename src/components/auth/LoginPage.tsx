import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Activity, GraduationCap, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [studentCredentials, setStudentCredentials] = useState({ rollNumber: '', password: '' });
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStudentLogin = async (e: { preventDefault: () => void; }) => {
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

  const handleAdminLogin = async (e: { preventDefault: () => void; }) => {
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

  const fillDemoCredentials = (type: string) => {
    if (type === 'admin') {
      setAdminCredentials({ email: 'admin@ignite.edu', password: 'admin123' });
    } else {
      setStudentCredentials({ rollNumber: 'CS2021001', password: 'student123' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-pink-600 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400 to-blue-600 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8 animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-30"></div>
            <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-white/20">
              <Activity className="h-20 w-20 text-blue-600 mx-auto" />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-gradient leading-tight">
                Ignite Planner
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <p className="text-2xl font-semibold text-blue-600">Kumaraguru College</p>
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-xl text-gray-600 leading-relaxed max-w-md mx-auto">
                Streamlined Lead & Co-Lead Management System for Modern Education
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-soft"></div>
                <span className="text-sm font-medium text-gray-700">Secured with Firebase</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 animate-slide-in-right">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-4 mb-8">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-white p-4 rounded-2xl shadow-xl border border-white/20">
                  <Activity className="h-12 w-12 text-blue-600" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient">Ignite Planner</h1>
              <p className="text-blue-600 font-semibold">Kumaraguru College</p>
            </div>
          </div>

          <div className="text-center space-y-3 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">Please sign in to your account to continue</p>
          </div>

          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Account Access</CardTitle>
              <CardDescription className="text-gray-600">
                Select your role to continue your journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 p-1 rounded-xl h-14">
                  <TabsTrigger 
                    value="student" 
                    className="flex items-center justify-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-blue-200 rounded-lg transition-all h-12 font-semibold"
                  >
                    <GraduationCap className="h-5 w-5" />
                    <span>Student</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin" 
                    className="flex items-center justify-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-green-200 rounded-lg transition-all h-12 font-semibold"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="student" className="mt-8">
                  <form onSubmit={handleStudentLogin} className="space-y-6">
                    <div className="space-y-4">
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
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm bg-white/50"
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
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm bg-white/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => fillDemoCredentials('student')}
                        className="w-full h-12 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-700 rounded-xl text-sm font-semibold btn-hover-lift"
                      >
                        Use Demo Credentials
                      </Button>
                      <Button 
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl group btn-hover-lift"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <GraduationCap className="h-5 w-5 mr-2" />
                            Sign in as Student
                            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="admin" className="mt-8">
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div className="space-y-4">
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
                          className="h-12 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-xl text-sm bg-white/50"
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
                          className="h-12 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-xl text-sm bg-white/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => fillDemoCredentials('admin')}
                        className="w-full h-12 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-700 rounded-xl text-sm font-semibold btn-hover-lift"
                      >
                        Use Demo Credentials
                      </Button>
                      <Button 
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl group btn-hover-lift"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5 mr-2" />
                            Sign in as Admin
                            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>

              {error && (
                <Alert className="border-red-200 bg-red-50 rounded-xl">
                  <AlertDescription className="text-red-700 text-sm font-medium">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              © 2025 Kumaraguru Institutions. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};