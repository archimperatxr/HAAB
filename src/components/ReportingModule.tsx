import React, { useState, useEffect } from 'react';
import { User } from '../App';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

interface ReportingModuleProps {
  user: User;
}

/**
 * A dynamic reporting module that displays key metrics and charts
 * based on the current user's role.
 */
export function ReportingModule({ user }: ReportingModuleProps) {
  const { requests, loading } = useWorkflow();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    inReview: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [reportTitle, setReportTitle] = useState('');

  useEffect(() => {
    if (requests.length > 0) {
      // Filter requests based on user role
      const relevantRequests = requests.filter(req => {
        if (user.role === 'initiator') {
          return req.initiator_id === user.id;
        }
        if (user.role === 'supervisor') {
          return req.assigned_supervisor_id === user.id;
        }
        // Admin sees all requests
        return true;
      });

      // Calculate statistics from the filtered requests
      const newStats = {
        total: relevantRequests.length,
        pending: relevantRequests.filter(req => req.status === 'pending').length,
        approved: relevantRequests.filter(req => req.status === 'approved').length,
        rejected: relevantRequests.filter(req => req.status === 'rejected').length,
        inReview: relevantRequests.filter(req => req.status === 'in_review').length,
      };
      setStats(newStats);

      // Generate mock chart data by month from the filtered requests
      const monthlyCounts = relevantRequests.reduce((acc, req) => {
        const date = new Date(req.created_at);
        const monthYear = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const newChartData = Object.keys(monthlyCounts).map(key => ({
        name: key,
        requests: monthlyCounts[key],
      }));
      setChartData(newChartData);

      // Set a title based on the user's role
      switch (user.role) {
        case 'initiator':
          setReportTitle('My Request Reports');
          break;
        case 'supervisor':
          setReportTitle('My Assigned Request Reports');
          break;
        case 'admin':
          setReportTitle('All System Reports');
          break;
        default:
          setReportTitle('Reports');
      }
    }
  }, [requests, user.role, user.id]);

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) => (
    <div className={`p-6 rounded-xl shadow-sm border ${color}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">{reportTitle}</h2>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={stats.total}
          icon={ClipboardList}
          color="bg-white"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="bg-white"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="bg-white"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="bg-white"
        />
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                borderColor: '#e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{
                fontWeight: 'bold',
                color: '#1f2937',
              }}
            />
            <Bar
              type="monotone"
              dataKey="requests"
              fill="#bfdbfe"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
