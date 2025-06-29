import React, { useState } from 'react';
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
import { LogOut, Activity, Calendar, FileText, BarChart3, Menu, X, Bell, User, Sparkles } from 'lucide-react';

const navigationItems = [
  { icon: Calendar, label: 'Activities', path: '/student', color: 'text-blue-600', bgColor: 'bg-blue-50', hoverColor: 'hover:bg-blue-100' },
  { icon: FileText, label: 'My Submissions', path: '/student/submissions', color: 'text-emerald-600', bgColor: 'bg-emerald-50', hoverColor: 'hover:bg-emerald-100' },
  { icon: BarChart3, label: 'Dashboard', path: '/student/dashboard', color: 'text-purple-600', bgColor: 'bg-purple-50', hoverColor: 'hover:bg-purple-100' },
];

export const StudentLayout: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const currentPage = navigationItems.find(item => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">
                  Ignite Day Planner
                </h1>
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  <p className="text-xs text-gray-600 font-medium">Student Portal</p>
                </div>
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
                  className={`flex items-center space-x-2 h-12 px-4 rounded-xl transition-all duration-200 font-medium ${
                    location.pathname === item.path 
                      ? `${item.bgColor} ${item.color} border border-current/20 shadow-sm` 
                      : `text-gray-700 ${item.hoverColor} hover:text-gray-900`
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${location.pathname === item.path ? item.color : 'text-gray-500'}`} />
                  <span>{item.label}</span>
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
                className="md:hidden rounded-xl hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="rounded-xl relative hidden sm:flex hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>

              {/* User info and menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{userProfile?.name}</p>
                  <p className="text-xs text-gray-500">{userProfile?.brigadeName}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-12 w-12 rounded-xl hover:bg-gray-100">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold">
                          {userProfile?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 rounded-xl shadow-xl border-0 bg-white/95 backdrop-blur-xl" align="end">
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm font-semibold text-gray-900">{userProfile?.name}</p>
                        <p className="text-xs text-gray-600">Roll: {userProfile?.rollNumber}</p>
                        <p className="text-xs text-gray-600">Brigade: {userProfile?.brigadeName}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                            Student
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg m-2">
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
            <div className="md:hidden border-t border-gray-200/50 py-4 bg-white/50 backdrop-blur-sm rounded-b-xl">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`w-full justify-start h-12 rounded-xl font-medium ${
                      location.pathname === item.path 
                        ? `${item.bgColor} ${item.color} border border-current/20 shadow-sm` 
                        : `text-gray-700 ${item.hoverColor} hover:text-gray-900`
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${location.pathname === item.path ? item.color : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </Button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {currentPage?.label || 'Student Portal'}
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-semibold text-gray-900">{userProfile?.name}</p>
              <p className="text-xs text-gray-500">{userProfile?.brigadeName}</p>
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