import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { getNotificationsApi, markNotificationReadApi, getComplaintByIdApi } from '../api';
import { Shield, Bell, User, LogOut, LogIn, Sparkles, UserPlus, Sun, Moon, Globe } from 'lucide-react';

export default function Navbar({ onOpenNewComplaint, onOpenAuth, onSelectComplaint }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, theme, toggleTheme, t } = useUI();
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
      setNotifications(res.data || []);
    } catch (e) {
      // Ignored if unauthenticated or offline
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
          <span>{t('appName')}</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>{t('appPulse')}</span>
        </div>
        <span className="ai-pill">
          <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
          {t('aiPowered')}
        </span>
      </div>

      <div className="nav-actions">
        {/* Language Selector (English, Hindi, Marathi) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-card)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Globe size={14} color="var(--primary)" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: 'transparent',
              color: 'var(--text-primary)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
            title="Switch Language / भाषा निवडा / भाषा बदलें"
          >
            <option value="en" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>English</option>
            <option value="hi" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>हिंदी (Hindi)</option>
            <option value="mr" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>मराठी (Marathi)</option>
          </select>
        </div>

        {/* Theme Toggle (Dark / Light) */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('themeLight') : t('themeDark')}
          style={{ padding: '0.45rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#6366f1" />}
        </button>

        {/* Authenticated State */}
        {user ? (
          <>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                className="notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title={t('activityAlerts')}
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
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '1rem',
                  zIndex: 1000,
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{t('activityAlerts')}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unreadCount} unread</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                      {t('noAlerts')}
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          style={{
                            padding: '0.6rem',
                            background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.12)',
                            border: '1px solid ' + (n.isRead ? 'var(--border)' : 'rgba(99, 102, 241, 0.3)'),
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          <div style={{ fontWeight: 700, color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.title}</div>
                          <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>{n.message}</div>
                          {n.complaintId && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
                              {t('inspectComplaint')} #{n.complaintId} →
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-secondary)',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)'
              }}>
                <User size={15} color="var(--primary)" />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
                  {user.departmentName && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {user.departmentName}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  background: user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.2)' : (user.role === 'EMPLOYEE' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                  color: user.role === 'ADMIN' ? '#f87171' : (user.role === 'EMPLOYEE' ? '#fbbf24' : '#34d399'),
                  marginLeft: '4px'
                }}>
                  {t(user.role?.toLowerCase()) || user.role}
                </span>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={logout}
                title={t('logout')}
                style={{ padding: '0.45rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </>
        ) : (
          /* Unauthenticated State */
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenAuth && onOpenAuth('login')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogIn size={15} />
              {t('signIn')}
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onOpenAuth && onOpenAuth('register')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={15} />
              {t('register')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
