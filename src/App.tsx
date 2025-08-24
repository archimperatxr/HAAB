import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { InitiatorWorkspace } from './components/InitiatorWorkspace';
import { SupervisorWorkspace } from './components/SupervisorWorkspace';
import { AdminConsole } from './components/AdminConsole';
import { Navigation } from './components/Navigation';
import { ReportingModule } from './components/ReportingModule'; // Import the new component
import { WorkflowProvider } from './context/WorkflowContext';
import { ThemeProvider } from './context/ThemeContext';
import { User as SupabaseUser } from './lib/supabase';

export type UserRole = 'initiator' | 'supervisor' | 'admin';

// Use the Supabase User type but with compatible interface
export type User = SupabaseUser;

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'workspace' | 'admin' | 'reports'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('haab-user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('haab-user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('haab-user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('haab-user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <ThemeProvider>
      <WorkflowProvider currentUser={currentUser}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navigation 
            user={currentUser} 
            currentView={currentView}
            onViewChange={setCurrentView}
            onLogout={handleLogout}
          />
          
          <main className="pt-16">
            {currentView === 'dashboard' && (
              <Dashboard 
                user={currentUser} 
                onNavigateToWorkspace={() => setCurrentView('workspace')}
                onNavigateToAdmin={() => setCurrentView('admin')}
                onNavigateToReports={() => setCurrentView('reports')}
              />
            )}
            
            {currentView === 'workspace' && currentUser.role === 'initiator' && 
              <InitiatorWorkspace user={currentUser} />
            }
            
            {currentView === 'workspace' && currentUser.role === 'supervisor' && 
              <SupervisorWorkspace user={currentUser} />
            }
            
            {currentView === 'admin' && currentUser.role === 'admin' && 
              <AdminConsole user={currentUser} />
            }
            
            {currentView === 'reports' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ReportingModule user={currentUser} />
              </div>
            )}
          </main>
        </div>
      </WorkflowProvider>
    </ThemeProvider>
  );
}

export default App;