import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Shield, User, Mail, Lock, Phone, LogIn, UserPlus, AlertCircle, Info } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { login, register } = useAuth();
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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const res = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: 'CITIZEN'
      });
      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '460px' }}>
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
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
            style={{ flex: 1, padding: '0.75rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={16} /> Citizen Register
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
                <label className="form-label">Email Address</label>
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
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your secure password"
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
                {loading ? 'Verifying Credentials...' : 'Sign In'}
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
                  <strong>Role-Based Access Control:</strong> Citizens, Department Officers, and Municipal Administrators must authenticate using their registered credentials.
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
              <div className="form-group">
                <label className="form-label">Full Name *</label>
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
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. ramesh@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone Number *</label>
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
                <label className="form-label">Create Password *</label>
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
                <label className="form-label">Confirm Password *</label>
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
                {loading ? 'Creating Citizen Account...' : 'Register as Citizen'}
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
