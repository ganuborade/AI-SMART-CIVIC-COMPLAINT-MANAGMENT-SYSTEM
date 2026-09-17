import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { getDepartmentsApi } from '../api';
import { X, Shield, User, Mail, Lock, Phone, LogIn, UserPlus, AlertCircle, Info, Key, Building2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { login, register } = useAuth();
  const { t } = useUI();
  const [tab, setTab] = useState(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('CITIZEN'); // 'CITIZEN' | 'EMPLOYEE' | 'ADMIN'
  const [regDeptId, setRegDeptId] = useState('');
  const [regSecretKey, setRegSecretKey] = useState('');

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      fetchDepartments();
    }
  }, [isOpen, initialTab]);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartmentsApi();
      setDepartments(res.data || []);
      if (res.data?.length > 0 && !regDeptId) {
        setRegDeptId(res.data[0].id);
      }
    } catch (e) {
      console.warn('Could not fetch departments for registration', e);
    }
  };

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (regRole === 'EMPLOYEE') {
      if (!regDeptId) {
        setError('Please select your municipal department.');
        return;
      }
      if (!regSecretKey.trim()) {
        setError('Municipal Staff Authorization Passkey is required (default: STAFF@2026).');
        return;
      }
    }

    if (regRole === 'ADMIN') {
      if (!regSecretKey.trim()) {
        setError('Administrator Security Passkey is required (default: ADMIN@2026).');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: regRole,
        departmentId: regRole === 'EMPLOYEE' ? Number(regDeptId) : null,
        secretKey: regSecretKey.trim()
      });

      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '480px', maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon" style={{ width: '36px', height: '36px' }}>
              <Shield size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>CivicAI Pulse</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Municipal Smart Grievance Management
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <button
            type="button"
            className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
            style={{ flex: 1, padding: '0.75rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogIn size={16} /> {t('signIn')}
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
            style={{ flex: 1, padding: '0.75rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={16} /> {t('register')}
          </button>
        </div>

        {error && (
          <div style={{
            margin: '1rem 1.5rem 0',
            padding: '0.65rem 0.85rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-sm)',
            color: '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="modal-body" style={{ padding: '1.25rem 1.5rem 0.5rem' }}>
              <div className="form-group">
                <label className="form-label">{t('emailAddress')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. admin@civic.gov or ganesh@citizen.org"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('password')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.75rem', justifyContent: 'center' }}
              >
                <LogIn size={16} />
                {loading ? 'Verifying Credentials...' : t('signIn')}
              </button>

              <div style={{
                marginTop: '1.25rem',
                padding: '0.75rem',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Role-Based Access:</strong> Citizens, Department Officers, and Municipal Administrators authenticate with their registered credentials.
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="modal-body" style={{ padding: '1.25rem 1.5rem 0.5rem' }}>
              {/* Account Role Selector */}
              <div className="form-group">
                <label className="form-label">{t('accountType')} *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setRegRole('CITIZEN'); setRegSecretKey(''); }}
                    style={{
                      padding: '0.5rem 0.25rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid ' + (regRole === 'CITIZEN' ? 'var(--primary)' : 'var(--border)'),
                      background: regRole === 'CITIZEN' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
                      color: regRole === 'CITIZEN' ? '#fff' : 'var(--text-secondary)',
                      textAlign: 'center'
                    }}
                  >
                    👤 {t('citizen')}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setRegRole('EMPLOYEE'); }}
                    style={{
                      padding: '0.5rem 0.25rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid ' + (regRole === 'EMPLOYEE' ? '#f59e0b' : 'var(--border)'),
                      background: regRole === 'EMPLOYEE' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-secondary)',
                      color: regRole === 'EMPLOYEE' ? '#fbbf24' : 'var(--text-secondary)',
                      textAlign: 'center'
                    }}
                  >
                    👷 {t('employee')}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setRegRole('ADMIN'); }}
                    style={{
                      padding: '0.5rem 0.25rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid ' + (regRole === 'ADMIN' ? '#ef4444' : 'var(--border)'),
                      background: regRole === 'ADMIN' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-secondary)',
                      color: regRole === 'ADMIN' ? '#f87171' : 'var(--text-secondary)',
                      textAlign: 'center'
                    }}
                  >
                    🛡️ {t('admin')}
                  </button>
                </div>
              </div>

              {/* Department Selector (For Employee) */}
              {regRole === 'EMPLOYEE' && (
                <div className="form-group" style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <label className="form-label" style={{ color: '#fbbf24' }}>
                    <Building2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {t('selectDept')} *
                  </label>
                  <select
                    className="form-select"
                    value={regDeptId}
                    onChange={(e) => setRegDeptId(e.target.value)}
                    required
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Security Passkey Input (For Employee or Admin) */}
              {(regRole === 'EMPLOYEE' || regRole === 'ADMIN') && (
                <div className="form-group" style={{
                  background: regRole === 'ADMIN' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid ' + (regRole === 'ADMIN' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)')
                }}>
                  <label className="form-label" style={{ color: regRole === 'ADMIN' ? '#f87171' : '#fbbf24' }}>
                    <Key size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {regRole === 'ADMIN' ? t('adminSecretKey') : t('staffSecretKey')} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="form-input"
                      placeholder={regRole === 'ADMIN' ? 'Default: ADMIN@2026' : 'Default: STAFF@2026'}
                      value={regSecretKey}
                      onChange={(e) => setRegSecretKey(e.target.value)}
                      required
                      style={{ paddingLeft: '2.4rem' }}
                    />
                    <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Configured securely in backend .env to restrict unauthorized administrative signups.
                  </span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{t('fullName')} *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Kumar"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('emailAddress')} *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. user@civic.gov"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('phoneNumber')} *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('password')} *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('confirmPassword')} *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.75rem', justifyContent: 'center' }}
              >
                <UserPlus size={16} />
                {loading ? 'Creating Account...' : `Register as ${t(regRole.toLowerCase())}`}
              </button>
            </div>

            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
