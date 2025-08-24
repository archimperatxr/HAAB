import React from 'react';
import { Building2, Home, Briefcase, Settings, LogOut, BarChart2, Moon, Sun } from 'lucide-react';
import { User } from '../App';
import { useTheme } from '../context/ThemeContext';

interface NavigationProps {
  user: User;
  currentView: 'dashboard' | 'workspace' | 'admin' | 'reports';
  onViewChange: (view: 'dashboard' | 'workspace' | 'admin' | 'reports') => void;
  onLogout: () => void;
}

export function Navigation({ user, currentView, onViewChange, onLogout }: NavigationProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-50 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 dark:bg-blue-500 rounded-lg p-2">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">H.A.A-B</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Workflow System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onViewChange('workspace')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'workspace' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Admin</span>
              </button>
            )}

            <button
              onClick={() => onViewChange('reports')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'reports' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <BarChart2 className="h-5 w-5" />
              <span>Reports</span>
            </button>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role} • {user.department}</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
