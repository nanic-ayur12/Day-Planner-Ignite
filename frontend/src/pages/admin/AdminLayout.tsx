import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
import {
  Calendar,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Home,
  Upload,
  Activity,
  Shield,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const sidebarItems = [
  { icon: Home, label: 'Overview', path: '/admin', color: 'text-blue-600' },
  { icon: Calendar, label: 'Events', path: '/admin/events', color: 'text-green-600' },
  { icon: Users, label: 'User Management', path: '/admin/users', color: 'text-purple-600' },
  { icon: Shield, label: 'Brigade Management', path: '/admin/brigades', color: 'text-orange-600' },
  { icon: Upload, label: 'Submissions', path: '/admin/submissions', color: 'text-red-600' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', color: 'text-indigo-600' },
  { icon: FileText, label: 'System Logs', path: '/admin/logs', color: 'text-gray-600' },
];

export const AdminLayout: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Show login success toast on first load
  useEffect(() => {
    const hasShownToast = sessionStorage.getItem('adminLoginToastShown');
    if (!hasShownToast) {
      toast({
        title: "Welcome Back!",
        description: "Successfully logged into admin dashboard",
        variant: "success",
      });
      sessionStorage.setItem('adminLoginToastShown', 'true');
    }
  }, [toast]);

  const handleLogout = async () => {
    try {
      await logout();
      sessionStorage.removeItem('adminLoginToastShown');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
        variant: "success",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const currentPage = sidebarItems.find(item => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0 shadow-2xl flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 border-b border-blue-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">Ignite Portal</h1>
              <p className="text-xs text-blue-100">Admin Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/20 focus:outline-none focus:ring-0 focus-visible:ring-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-8 px-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start h-12 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 ${
                  location.pathname === item.path 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-md' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className={`h-5 w-5 mr-4 ${location.pathname === item.path ? 'text-blue-600' : item.color}`} />
                <span className="font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* Enhanced Sidebar Footer */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Ignite Student Portal</p>
                <p className="text-xs text-gray-600">Kumaraguru Institutions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-4 lg:px-8 shadow-lg">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden focus:outline-none focus:ring-0 focus-visible:ring-0"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {currentPage?.label || 'Admin Dashboard'}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{userProfile?.name}</p>
              <p className="text-xs text-gray-500">{userProfile?.email}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-12 w-12 rounded-xl focus:outline-none focus:ring-0 focus-visible:ring-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                      {userProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-semibold text-gray-900">{userProfile?.name}</p>
                    <p className="text-xs text-gray-600">{userProfile?.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                        Administrator
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
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};