import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { InitiatorWorkspace } from './components/InitiatorWorkspace';
import { SupervisorWorkspace } from './components/SupervisorWorkspace';
import { AdminConsole } from './components/AdminConsole';
import { Navigation } from './components/Navigation';
import { WorkflowProvider } from './context/WorkflowContext';
import { User as SupabaseUser } from './lib/supabase';

export type UserRole = 'initiator' | 'supervisor' | 'admin';

// Use the Supabase User type but with compatible interface
export type User = SupabaseUser;

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'workspace' | 'admin'>('dashboard');
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
    setCurrentView('dashboard');
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
    <WorkflowProvider currentUser={currentUser}>
      <div className="min-h-screen bg-gray-50">
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
        </main>
      </div>
    </WorkflowProvider>
  );
}

export default App;