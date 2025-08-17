import React, { useState, useEffect } from 'react';
import { User } from '../App';
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
 * A dynamic reporting module that displays key metrics and a custom
 * bar chart based on the current user's role.
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

  // Custom Bar Chart Component
  const CustomBarChart = ({ data }: { data: any[] }) => {
    if (data.length === 0) {
      return (
        <div className="text-center text-gray-500 p-8">
          No data available to display in the chart.
        </div>
      );
    }

    const maxRequests = Math.max(...data.map(d => d.requests));

    return (
      <div className="flex items-end justify-around h-64 p-4 border-b border-l border-gray-300 relative">
        {data.map((d, index) => (
          <div key={index} className="flex flex-col items-center justify-end h-full mx-2">
            <div
              className="w-10 bg-blue-500 transition-all duration-300 rounded-t-lg shadow-md"
              style={{ height: `${(d.requests / maxRequests) * 100}%` }}
            ></div>
            <span className="text-sm mt-2 text-gray-600">{d.name}</span>
            <span className="text-xs font-medium text-gray-800 absolute bottom-10">{d.requests}</span>
          </div>
        ))}
      </div>
    );
  };

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
        <CustomBarChart data={chartData} />
      </div>
    </div>
  );
}
