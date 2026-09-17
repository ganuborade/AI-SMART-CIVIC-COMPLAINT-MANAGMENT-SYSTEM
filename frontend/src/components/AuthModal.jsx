import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { getDepartmentsApi } from '../api';
import {
  X,
  Shield,
  User,
  Mail,
  Lock,
  Phone,
  LogIn,
  UserPlus,
  AlertCircle,
  Info,
  Key,
  Building2,
  Eye,
  EyeOff,
  Briefcase,
  Users
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', initialRole = 'CITIZEN' }) {
  const { login, register } = useAuth();
  const { t } = useUI();

  // Active Role Portal: 'CITIZEN' | 'EMPLOYEE' | 'ADMIN'
  const [selectedRole, setSelectedRole] = useState(initialRole);
  // Active Action: 'login' | 'register'
  const [actionTab, setActionTab] = useState(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regDeptId, setRegDeptId] = useState('');
  const [regSecretKey, setRegSecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActionTab(initialTab);
      setSelectedRole(initialRole || 'CITIZEN');
      setError('');
      fetchDepartments();
    }
  }, [isOpen, initialTab, initialRole]);

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
        setError(res.message || 'Invalid email or password. Please verify your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (selectedRole === 'EMPLOYEE') {
      if (!regDeptId) {
        setError('Please select your municipal department.');
        return;
      }
      if (!regSecretKey.trim()) {
        setError('Official Municipal Staff Authorization Passkey is required.');
        return;
      }
    }

    if (selectedRole === 'ADMIN') {
      if (!regSecretKey.trim()) {
        setError('Official Administrator Security Passkey is required.');
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
        role: selectedRole,
        departmentId: selectedRole === 'EMPLOYEE' ? Number(regDeptId) : null,
        secretKey: regSecretKey.trim()
      });

      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon" style={{ width: '36px', height: '36px' }}>
              <Shield size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>CivicAI Pulse</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Municipal Smart Complaint Redressal System
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* 1. TOP ROLE SELECTOR: 3 Distinct Portals */}
        <div style={{ padding: '0.75rem 1.25rem 0', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
            Select Authorized Portal
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              onClick={() => { setSelectedRole('CITIZEN'); setError(''); }}
              style={{
                padding: '0.6rem 0.35rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: '1px solid ' + (selectedRole === 'CITIZEN' ? 'var(--primary)' : 'var(--border)'),
                background: selectedRole === 'CITIZEN' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
                color: selectedRole === 'CITIZEN' ? '#fff' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer'
              }}
            >
              <Users size={16} color={selectedRole === 'CITIZEN' ? 'var(--primary)' : 'var(--text-muted)'} />
              <span>{t('citizen')}</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('EMPLOYEE'); setError(''); }}
              style={{
                padding: '0.6rem 0.35rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: '1px solid ' + (selectedRole === 'EMPLOYEE' ? '#38bdf8' : 'var(--border)'),
                background: selectedRole === 'EMPLOYEE' ? 'rgba(2, 132, 199, 0.2)' : 'var(--bg-secondary)',
                color: selectedRole === 'EMPLOYEE' ? '#38bdf8' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer'
              }}
            >
              <Briefcase size={16} color={selectedRole === 'EMPLOYEE' ? '#38bdf8' : 'var(--text-muted)'} />
              <span>{t('employee')}</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('ADMIN'); setError(''); }}
              style={{
                padding: '0.6rem 0.35rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: '1px solid ' + (selectedRole === 'ADMIN' ? '#f59e0b' : 'var(--border)'),
                background: selectedRole === 'ADMIN' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-secondary)',
                color: selectedRole === 'ADMIN' ? '#fbbf24' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer'
              }}
            >
              <Shield size={16} color={selectedRole === 'ADMIN' ? '#fbbf24' : 'var(--text-muted)'} />
              <span>{t('admin')}</span>
            </button>
          </div>
        </div>

        {/* 2. SUB TAB SWITCHER: Sign In vs Create Account */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginTop: '0.75rem' }}>
          <button
            type="button"
            className={`tab-btn ${actionTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActionTab('login'); setError(''); }}
            style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogIn size={15} /> {t('signIn')}
          </button>
          <button
            type="button"
            className={`tab-btn ${actionTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActionTab('register'); setError(''); }}
            style={{ flex: 1, padding: '0.65rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={15} /> {t('register')}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            margin: '1rem 1.25rem 0',
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

        {/* Action Panel: Login vs Register */}
        {actionTab === 'login' ? (
          /* ================= LOGIN FORM ================= */
          <form onSubmit={handleLoginSubmit}>
            <div className="modal-body" style={{ padding: '1.25rem 1.25rem 0.5rem' }}>
              <div style={{
                marginBottom: '1rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: selectedRole === 'ADMIN'
                  ? 'rgba(245, 158, 11, 0.1)'
                  : selectedRole === 'EMPLOYEE'
                  ? 'rgba(2, 132, 199, 0.1)'
                  : 'rgba(99, 102, 241, 0.1)',
                border: '1px solid ' + (selectedRole === 'ADMIN'
                  ? 'rgba(245, 158, 11, 0.25)'
                  : selectedRole === 'EMPLOYEE'
                  ? 'rgba(2, 132, 199, 0.25)'
                  : 'rgba(99, 102, 241, 0.25)'),
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                Signing in as: <strong style={{ color: '#fff' }}>
                  {selectedRole === 'ADMIN' ? 'Municipal Administrator' : selectedRole === 'EMPLOYEE' ? 'Municipal Staff / Officer' : 'Public Citizen'}
                </strong>
              </div>

              <div className="form-group">
                <label className="form-label">{t('emailAddress')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter registered email"
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
                    type={showLoginPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.75rem', justifyContent: 'center' }}
              >
                <LogIn size={16} />
                {loading ? 'Authenticating...' : t('signIn')}
              </button>
            </div>

            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* ================= REGISTER FORM ================= */
          <form onSubmit={handleRegisterSubmit}>
            <div className="modal-body" style={{ padding: '1.25rem 1.25rem 0.5rem' }}>
              {/* Role Context Tag */}
              <div style={{
                marginBottom: '1rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: selectedRole === 'ADMIN'
                  ? 'rgba(245, 158, 11, 0.1)'
                  : selectedRole === 'EMPLOYEE'
                  ? 'rgba(2, 132, 199, 0.1)'
                  : 'rgba(99, 102, 241, 0.1)',
                border: '1px solid ' + (selectedRole === 'ADMIN'
                  ? 'rgba(245, 158, 11, 0.25)'
                  : selectedRole === 'EMPLOYEE'
                  ? 'rgba(2, 132, 199, 0.25)'
                  : 'rgba(99, 102, 241, 0.25)'),
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                Registering for: <strong style={{ color: '#fff' }}>
                  {selectedRole === 'ADMIN' ? 'Administrator Account' : selectedRole === 'EMPLOYEE' ? 'Municipal Staff Account' : 'Citizen Account'}
                </strong>
                {selectedRole === 'CITIZEN' && (
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Free public registration. No secret passkey required.
                  </span>
                )}
              </div>

              {/* Department Selector (Only for Municipal Officer) */}
              {selectedRole === 'EMPLOYEE' && (
                <div className="form-group" style={{ background: 'rgba(2, 132, 199, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
                  <label className="form-label" style={{ color: '#38bdf8' }}>
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

              {/* Secret Passkey Input (For Officer or Admin) - Completely Masked (Type=Password), NEVER Show Key */}
              {(selectedRole === 'EMPLOYEE' || selectedRole === 'ADMIN') && (
                <div className="form-group" style={{
                  background: selectedRole === 'ADMIN' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(2, 132, 199, 0.08)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid ' + (selectedRole === 'ADMIN' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(2, 132, 199, 0.3)')
                }}>
                  <label className="form-label" style={{ color: selectedRole === 'ADMIN' ? '#fbbf24' : '#38bdf8' }}>
                    <Key size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {selectedRole === 'ADMIN' ? t('adminSecretKey') : t('staffSecretKey')} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSecretKey ? 'text' : 'password'}
                      className="form-input"
                      placeholder={selectedRole === 'ADMIN' ? t('adminKeyPlaceholder') : t('staffKeyPlaceholder')}
                      value={regSecretKey}
                      onChange={(e) => setRegSecretKey(e.target.value)}
                      required
                      style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                    />
                    <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    🔒 Confidential authorization key provided by municipal IT administration.
                  </span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{t('fullName')} *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your full name"
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
                    placeholder="Enter email address"
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
                    placeholder="e.g. +91 90960 40485"
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
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('confirmPassword')} *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Confirm password"
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
                {loading ? 'Creating Account...' : `Register Account`}
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
