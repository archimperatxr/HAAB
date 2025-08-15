import React from 'react';
import { Building2, Home, Briefcase, Settings, LogOut } from 'lucide-react';
import { User } from '../App';

interface NavigationProps {
  user: User;
  currentView: 'dashboard' | 'workspace' | 'admin';
  onViewChange: (view: 'dashboard' | 'workspace' | 'admin') => void;
  onLogout: () => void;
}

export function Navigation({ user, currentView, onViewChange, onLogout }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 rounded-lg p-2">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">H.A.A-B</h1>
              <p className="text-xs text-gray-500">Workflow System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onViewChange('workspace')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'workspace' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Briefcase className="h-5 w-5" />
              <span>Workspace</span>
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => onViewChange('admin')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'admin' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Admin</span>
              </button>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role} • {user.department}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}