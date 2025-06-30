import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Activity, Calendar, FileText, BarChart3, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const navigationItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/student', color: 'text-purple-600' },
  { icon: Calendar, label: 'Activities', path: '/student/activities', color: 'text-blue-600' },
  { icon: FileText, label: 'My Submissions', path: '/student/submissions', color: 'text-emerald-600' },
];

export const StudentLayout: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // Show login success toast on first load
  useEffect(() => {
    const hasShownToast = sessionStorage.getItem('studentLoginToastShown');
    if (!hasShownToast) {
      toast({
        title: "Login Successful!",
        description: "Welcome to student dashboard",
        variant: "success",
      });
      sessionStorage.setItem('studentLoginToastShown', 'true');
    }
  }, [toast]);

  const handleLogout = async () => {
    try {
      await logout();
      sessionStorage.removeItem('studentLoginToastShown');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const currentPage = navigationItems.find(item => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-black">
                  Ignite Portal
                </h1>
                <p className="text-xs text-gray-600">Student </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 h-12 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ${
                    location.pathname === item.path 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-black hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-blue-600' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </Button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden rounded-lg focus:outline-none focus:ring-0 focus-visible:ring-0"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>

              {/* Live Time Display */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-black">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </p>
                <p className="text-xs text-gray-500">Live Time</p>
              </div>

              {/* User info and menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-black">{userProfile?.name}</p>
                  <p className="text-xs text-gray-500">{userProfile?.brigadeName}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-12 w-12 rounded-xl focus:outline-none focus:ring-0 focus-visible:ring-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                          {userProfile?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-black">{userProfile?.name}</p>
                        <p className="text-xs text-gray-600">Roll: {userProfile?.rollNumber}</p>
                        <p className="text-xs text-gray-600">Brigade: {userProfile?.brigadeName}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Student
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`w-full justify-start h-12 rounded-xl focus:outline-none focus:ring-0 focus-visible:ring-0 ${
                      location.pathname === item.path 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-black hover:bg-gray-100 hover:text-black'
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${location.pathname === item.path ? 'text-blue-600' : item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-black">
                {currentPage?.label || 'Student Portal'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};