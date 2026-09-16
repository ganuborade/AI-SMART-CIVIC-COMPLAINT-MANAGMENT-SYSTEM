import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import NewComplaintModal from './components/NewComplaintModal';
import ComplaintDetailModal from './components/ComplaintDetailModal';
import AuthModal from './components/AuthModal';

function MainApp() {
  const { user } = useAuth();
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

  return (
    <div className="app-container">
      <Navbar
        onOpenNewComplaint={handleOpenNewComplaint}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab || 'login');
          setIsAuthModalOpen(true);
        }}
        onSelectComplaint={(c) => setSelectedComplaint(c)}
      />

      <main className="main-content" key={refreshKey}>
        {user?.role === 'ADMIN' ? (
          <AdminDashboard onSelectComplaint={(c) => setSelectedComplaint(c)} />
        ) : user?.role === 'EMPLOYEE' ? (
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
