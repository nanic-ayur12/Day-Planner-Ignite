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
  LogOut,
  Menu,
  X,
  Home,
  Upload,
  Activity,
  Shield,
} from 'lucide-react';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/admin', color: 'text-blue-600' },
  { icon: Calendar, label: 'Events', path: '/admin/events', color: 'text-green-600' },
  { icon: Users, label: 'User Management', path: '/admin/users', color: 'text-purple-600' },
  { icon: Shield, label: 'Brigade Management', path: '/admin/brigades', color: 'text-orange-600' },
  { icon: Upload, label: 'Submissions', path: '/admin/submissions', color: 'text-red-600' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', color: 'text-indigo-600' },
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0 shadow-sm flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-black">Ignite Portal</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start h-11 px-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-black hover:bg-gray-100 hover:text-black'
                }`}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className={`h-5 w-5 mr-3 ${location.pathname === item.path ? 'text-blue-600' : item.color}`} />
                <span className="font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-black">Ignite Day Planner</p>
                <p className="text-xs text-gray-600">Kumaraguru College</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-black">
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
              <p className="text-sm font-semibold text-black">{userProfile?.name}</p>
              <p className="text-xs text-gray-500">{userProfile?.email}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                      {userProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-black">{userProfile?.name}</p>
                    <p className="text-xs text-gray-600">{userProfile?.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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