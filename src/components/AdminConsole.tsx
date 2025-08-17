import React, { useState } from 'react';
import { User } from '../App';
import { Users, Settings, Shield, Activity, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminConsoleProps {
  user: User;
}

interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'initiator' | 'supervisor' | 'admin';
  department: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

export function AdminConsole({ user }: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'audit' | 'settings'>('users');
  const [users, setUsers] = useState<UserAccount[]>([
    {
      id: '11111111-1111-1111-1111-111111111111',
      username: 'john.doe',
      fullName: 'John Doe',
      email: 'john.doe@haab.com',
      role: 'initiator',
      department: 'Customer Service',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2024-01-15T00:00:00Z'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      username: 'sarah.manager',
      fullName: 'Sarah Manager',
      email: 'sarah.manager@haab.com',
      role: 'supervisor',
      department: 'Operations',
      status: 'active',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: '2024-01-10T00:00:00Z'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      username: 'admin.user',
      fullName: 'Admin User',
      email: 'admin@haab.com',
      role: 'admin',
      department: 'IT',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2024-01-05T00:00:00Z'
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      username: 'jane.smith',
      fullName: 'Jane Smith',
      email: 'jane.smith@haab.com',
      role: 'initiator',
      department: 'Customer Service',
      status: 'inactive',
      createdAt: '2024-02-01T00:00:00Z'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [auditLogError, setAuditLogError] = useState<string | null>(null);

  // useEffect hook to fetch audit logs when the 'audit' tab is selected
  useEffect(() => {
    const getAuditLogs = async () => {
      setLoadingAuditLogs(true);
      setAuditLogError(null);

      try {
        const data = await fetchAuditLogs();
        setAuditLogs(data);
      } catch (error) {
        setAuditLogError('Failed to fetch audit logs. Please check RLS policy.');
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoadingAuditLogs(false);
      }
    };

    if (activeTab === 'audit') {
      getAuditLogs();
    }
  }, [activeTab]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const UserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <Plus className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(userAccount => (
                <tr key={userAccount.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{userAccount.fullName}</div>
                      <div className="text-sm text-gray-500">{userAccount.email}</div>
                      <div className="text-xs text-gray-400">@{userAccount.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(userAccount.role)}`}>
                      {userAccount.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {userAccount.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(userAccount.status)}`}>
                      {userAccount.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userAccount.lastLogin ? new Date(userAccount.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const PermissionManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Permission Management</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 rounded-lg p-2">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Initiator Permissions</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Create update requests</li>
            <li>• Edit draft requests</li>
            <li>• View own request status</li>
            <li>• Upload supporting documents</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 rounded-lg p-2">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Supervisor Permissions</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Review assigned requests</li>
            <li>• Approve/reject updates</li>
            <li>• Add review notes</li>
            <li>• View team performance</li>
            <li>• Reassign requests</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-100 rounded-lg p-2">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Admin Permissions</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Manage all users</li>
            <li>• Configure system settings</li>
            <li>• View all requests</li>
            <li>• Generate reports</li>
            <li>• Audit system activity</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const AuditLog = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent System Activity</h3>
        </div>
        <div className="p-6">
          {loadingAuditLogs && (
            <div className="text-center text-gray-500">Loading audit logs...</div>
          )}
          {auditLogError && (
            <div className="text-center text-red-500">{auditLogError}</div>
          )}
          {!loadingAuditLogs && !auditLogError && auditLogs.length === 0 && (
            <div className="text-center text-gray-500">No audit logs found.</div>
          )}
          {!loadingAuditLogs && !auditLogError && auditLogs.length > 0 && (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{log.action}</h4>
                      <span className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{log.user_id}</p> {/* Use log.user_id for now */}
                    <p className="text-sm text-gray-500 mt-1">{log.details.message || JSON.stringify(log.details)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SystemSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
      
      <div className="grid gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-assign requests to supervisors</label>
                <p className="text-sm text-gray-500">Automatically distribute new requests based on workload</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Require dual approval for high-priority requests</label>
                <p className="text-sm text-gray-500">High priority requests need approval from two supervisors</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Send email notifications for status changes</label>
                <p className="text-sm text-gray-500">Notify users when request status is updated</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session timeout (minutes)</label>
              <input
                type="number"
                defaultValue={120}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum failed login attempts</label>
              <input
                type="number"
                defaultValue={5}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enforce strong passwords</label>
                <p className="text-sm text-gray-500">Require complex passwords with special characters</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Integration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Core Banking System API Endpoint</label>
              <input
                type="url"
                defaultValue="https://api.haab-core.com/v1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Timeout (seconds)</label>
              <input
                type="number"
                defaultValue={30}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Test Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'audit', label: 'Audit Log', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
        <p className="text-gray-600 mt-2">Manage users, permissions, and system configuration</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'permissions' && <PermissionManagement />}
      {activeTab === 'audit' && <AuditLog />}
      {activeTab === 'settings' && <SystemSettings />}
    </div>
  );
}