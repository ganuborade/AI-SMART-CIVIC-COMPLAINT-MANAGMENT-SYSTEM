import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { getNotificationsApi, markNotificationReadApi, getComplaintByIdApi } from '../api';
import { Shield, Bell, User, LogOut, LogIn, Sparkles, PlusCircle } from 'lucide-react';

export default function Navbar({ onOpenNewComplaint, onOpenAuth, onSelectComplaint }) {
  const { user, quickLogin, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationsApi();
      setNotifications(res.data);
    } catch (e) {
      // Ignored if offline
    }
  };

  const handleNotificationClick = async (n) => {
    try {
      await markNotificationReadApi(n.id);
      setNotifications(notifications.map(item => item.id === n.id ? { ...item, isRead: true } : item));
      if (n.complaintId && onSelectComplaint) {
        setShowNotifications(false);
        const compRes = await getComplaintByIdApi(n.complaintId);
        onSelectComplaint(compRes.data);
      }
    } catch (e) {
      console.warn('Could not open notification complaint', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">
          <Shield size={22} />
        </div>
        <div>
          <span>CivicAI</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>Pulse</span>
        </div>
        <span className="ai-pill">
          <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
          AI Powered
        </span>
      </div>

      <div className="nav-actions">
        {/* Quick Persona Switcher */}
        <div className="persona-selector">
          <span className="persona-label">Persona:</span>
          <select
            className="persona-select"
            value={user?.email || ''}
            onChange={(e) => {
              const selected = DEMO_PERSONAS.find(p => p.email === e.target.value);
              if (selected) {
                quickLogin(selected.email, selected.password);
              }
            }}
          >
            {DEMO_PERSONAS.map(p => (
              <option key={p.email} value={p.email}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Bell */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '340px',
                background: '#1e293b',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '1rem',
                zIndex: 1000,
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>Activity Alerts</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unreadCount} unread</span>
                </div>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                    No notifications yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: '0.6rem',
                          background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid ' + (n.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(99, 102, 241, 0.25)'),
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: n.isRead ? 'var(--text-secondary)' : '#fff' }}>{n.title}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>{n.message}</div>
                        {n.complaintId && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
                            Tap to inspect Complaint #{n.complaintId} →
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Profile / Auth Action */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
              <User size={15} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-full)',
                background: user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.2)' : (user.role === 'EMPLOYEE' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                color: user.role === 'ADMIN' ? '#f87171' : (user.role === 'EMPLOYEE' ? '#fbbf24' : '#34d399')
              }}>
                {user.role}
              </span>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={logout}
              title="Log Out"
              style={{ padding: '0.4rem', borderRadius: '50%' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onOpenAuth && onOpenAuth('login')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <LogIn size={15} />
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}
