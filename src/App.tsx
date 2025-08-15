import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { InitiatorWorkspace } from './components/InitiatorWorkspace';
import { SupervisorWorkspace } from './components/SupervisorWorkspace';
import { AdminConsole } from './components/AdminConsole';
import { Navigation } from './components/Navigation';
import { WorkflowProvider } from './context/WorkflowContext';

export type UserRole = 'initiator' | 'supervisor' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  department: string;
  fullName: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'workspace' | 'admin'>('dashboard');

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('haab-user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
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

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <WorkflowProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation 
          user={currentUser} 
          currentView={currentView}
          onViewChange={setCurrentView}
          onLogout={handleLogout}
        />
        
        <main className="pt-16">
          {currentView === 'dashboard' && <Dashboard user={currentUser} />}
          
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