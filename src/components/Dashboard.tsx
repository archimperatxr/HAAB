import React from 'react';
import { User } from '../App';
import { useWorkflow } from '../context/WorkflowContext';
import { RequestDetailsModal } from './RequestDetailsModal';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp,
  AlertCircle,
  FileText
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigateToWorkspace?: () => void;
  onNavigateToAdmin?: () => void;
}

export function Dashboard({ user, onNavigateToWorkspace, onNavigateToAdmin }: DashboardProps) {
  const { requests } = useWorkflow();
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(null);

  const getStats = () => {
    const myRequests = requests.filter(req => 
      user.role === 'initiator' ? req.initiator_id === user.id :
      user.role === 'supervisor' ? req.assigned_supervisor_id === user.id :
      true
    );

    return {
      total: myRequests.length,
      pending: myRequests.filter(req => req.status === 'pending').length,
      approved: myRequests.filter(req => req.status === 'approved').length,
      rejected: myRequests.filter(req => req.status === 'rejected').length,
      inReview: myRequests.filter(req => req.status === 'in_review').length,
    };
  };

  const stats = getStats();

  const StatCard = ({ icon: Icon, title, value, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center">
        <div className={`${bgColor} rounded-lg p-3 mr-4`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );

  const RecentActivity = () => {
    const recentRequests = requests
      .filter(req => 
        user.role === 'initiator' ? req.initiator_id === user.id :
        user.role === 'supervisor' ? req.assigned_supervisor_id === user.id :
        true
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    const selectedRequest = selectedRequestId ? requests.find(req => req.id === selectedRequestId) : null;
    return (
      <>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">#{request.id}</p>
                      <p className="text-sm text-gray-600">{request.customer_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        request.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <button
                        onClick={() => setSelectedRequestId(request.id)}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        View
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Request Details Modal */}
        {selectedRequest && (
          <RequestDetailsModal
            request={selectedRequest}
            onClose={() => setSelectedRequestId(null)}
          />
        )}
      </>
    );
  };

  const handleCreateNewRequest = () => {
    if (onNavigateToWorkspace) {
      onNavigateToWorkspace();
    }
  };

  const handleReviewRequests = () => {
    if (onNavigateToWorkspace) {
      onNavigateToWorkspace();
    }
  };

  const handleViewReports = () => {
    if (onNavigateToReports) {
      onNavigateToReports();
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user.full_name}. Here's your workflow overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={ClipboardList}
          title="Total Requests"
          value={stats.total}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={Clock}
          title="Pending Review"
          value={stats.pending + stats.inReview}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          icon={CheckCircle}
          title="Approved"
          value={stats.approved}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={XCircle}
          title="Rejected"
          value={stats.rejected}
          color="text-red-600"
          bgColor="bg-red-100"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivity />
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {user.role === 'initiator' && (
              <button 
                onClick={handleCreateNewRequest}
                className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                <div className="flex items-center space-x-3">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">Create New Request</h4>
                    <p className="text-sm text-blue-700">Start a new customer information update request</p>
                  </div>
                </div>
              </button>
            )}
            
            {user.role === 'supervisor' && (
              <button 
                onClick={handleReviewRequests}
                className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Review Pending Requests</h4>
                    <p className="text-sm text-green-700">Review and approve/reject pending requests</p>
                  </div>
                </div>
              </button>
            )}
            
            <button 
              onClick={handleViewReports}
              className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    {user.role === 'admin' ? 'Admin Console' : 'View Reports'}
                  </h4>
                  <p className="text-sm text-gray-700">
                    {user.role === 'admin' 
                      ? 'Manage users and system settings' 
                      : 'Access workflow performance reports'
                    }
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}