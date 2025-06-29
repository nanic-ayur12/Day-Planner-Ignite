import React, { useState } from 'react';
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
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Upload,
  Activity,
  Bell,
  Search,
  Sparkles,
} from 'lucide-react';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/admin', color: 'text-blue-600', bgColor: 'bg-blue-50', hoverColor: 'hover:bg-blue-100' },
  { icon: Calendar, label: 'Events', path: '/admin/events', color: 'text-emerald-600', bgColor: 'bg-emerald-50', hoverColor: 'hover:bg-emerald-100' },
  { icon: Activity, label: 'Event Plans', path: '/admin/plans', color: 'text-orange-600', bgColor: 'bg-orange-50', hoverColor: 'hover:bg-orange-100' },
  { icon: Users, label: 'User Management', path: '/admin/users', color: 'text-purple-600', bgColor: 'bg-purple-50', hoverColor: 'hover:bg-purple-100' },
  { icon: Upload, label: 'Submissions', path: '/admin/submissions', color: 'text-pink-600', bgColor: 'bg-pink-50', hoverColor: 'hover:bg-pink-100' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', color: 'text-indigo-600', bgColor: 'bg-indigo-50', hoverColor: 'hover:bg-indigo-100' },
  { icon: Settings, label: 'Settings', path: '/admin/settings', color: 'text-gray-600', bgColor: 'bg-gray-50', hoverColor: 'hover:bg-gray-100' },
];

export const AdminLayout: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const currentPage = sidebarItems.find(item => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0 shadow-xl`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">Ignite Planner</h1>
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-white/80" />
                <p className="text-xs text-white/80 font-medium">Admin Dashboard</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/20 rounded-xl"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start h-14 px-4 rounded-xl transition-all duration-200 font-medium ${
                  location.pathname === item.path 
                    ? `${item.bgColor} ${item.color} border border-current/20 shadow-sm` 
                    : `text-gray-700 ${item.hoverColor} hover:text-gray-900`
                }`}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className={`h-5 w-5 mr-3 ${location.pathname === item.path ? item.color : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Ignite Day Planner</p>
                <p className="text-xs text-gray-600">Kumaraguru College</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-6 lg:px-8 shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-xl hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentPage?.label || 'Admin Dashboard'}
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex rounded-xl hover:bg-gray-100">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="relative rounded-xl hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
            </Button>
            
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{userProfile?.name}</p>
              <p className="text-xs text-gray-500">{userProfile?.email}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-12 w-12 rounded-xl hover:bg-gray-100">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold">
                      {userProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-xl shadow-xl border-0 bg-white/95 backdrop-blur-xl" align="end">
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-semibold text-gray-900">{userProfile?.name}</p>
                    <p className="text-xs text-gray-600">{userProfile?.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                        Administrator
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
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};