import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import NewComplaintModal from './components/NewComplaintModal';
import ComplaintDetailModal from './components/ComplaintDetailModal';
import AuthModal from './components/AuthModal';

function MainApp() {
  const { user, loading } = useAuth();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = (newComplaint) => {
    setRefreshKey(prev => prev + 1);
    setSelectedComplaint(newComplaint);
  };

  const handleUpdated = (updatedComplaint) => {
    setRefreshKey(prev => prev + 1);
    setSelectedComplaint(updatedComplaint);
  };

  const handleOpenNewComplaint = () => {
    if (!user) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }
    setIsNewModalOpen(true);
  };

  const handleOpenAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-icon" style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
          </div>
          <p>Loading CivicAI Pulse Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        onOpenNewComplaint={handleOpenNewComplaint}
        onOpenAuth={handleOpenAuth}
        onSelectComplaint={(c) => setSelectedComplaint(c)}
      />

      <main className="main-content" key={refreshKey}>
        {!user ? (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
          />
        ) : user.role === 'ADMIN' ? (
          <AdminDashboard onSelectComplaint={(c) => setSelectedComplaint(c)} />
        ) : user.role === 'EMPLOYEE' ? (
          <EmployeeDashboard onSelectComplaint={(c) => setSelectedComplaint(c)} />
        ) : (
          <CitizenDashboard
            onOpenNewComplaint={handleOpenNewComplaint}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
          />
        )}
      </main>

      {/* New Complaint Modal */}
      <NewComplaintModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={handleCreated}
      />

      {/* Complaint Detail Dossier Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdated={handleUpdated}
        currentUserId={user?.id}
      />

      {/* Sign In & Citizen Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
