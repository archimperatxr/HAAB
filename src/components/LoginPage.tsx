import React, { useState } from 'react';
import { Building2, Lock, User } from 'lucide-react';
import { User as UserType } from '../App';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

// Mock users for demonstration
const mockUsers: UserType[] = [
  { id: '1', username: 'john.doe', role: 'initiator', department: 'Customer Service', fullName: 'John Doe' },
  { id: '2', username: 'sarah.manager', role: 'supervisor', department: 'Operations', fullName: 'Sarah Manager' },
  { id: '3', username: 'admin.user', role: 'admin', department: 'IT', fullName: 'Admin User' },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const user = mockUsers.find(u => u.username === username);
      if (user && password === 'password123') {
        onLogin(user);
      } else {
        setError('Invalid credentials. Use any username from the demo list with password "password123"');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 rounded-full p-3">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">H.A.A-B</h1>
            <p className="text-gray-600 mt-2">Customer Information Workflow System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Users */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Users:</h3>
            <div className="space-y-2 text-sm">
              {mockUsers.map(user => (
                <div key={user.id} className="flex justify-between text-gray-600">
                  <span>{user.username}</span>
                  <span className="capitalize">{user.role}</span>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-2">Password for all users: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}