import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { deleteProfileApi } from '../api';
import { User, Mail, Phone, Briefcase, Shield, Calendar, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { t } = useUI();
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !user) return null;

  const roleLabel =
    user.role === 'ADMIN'
      ? t('admin') || 'Administrator'
      : user.role === 'EMPLOYEE'
      ? t('employee') || 'Municipal Field Officer'
      : t('citizen') || 'Citizen';

  const roleBadgeStyle =
    user.role === 'ADMIN'
      ? { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }
      : user.role === 'EMPLOYEE'
      ? { background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', border: '1px solid rgba(2, 132, 199, 0.3)' }
      : { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };

  const handleDeleteAccount = async () => {
    const roleWarning =
      user.role === 'CITIZEN'
        ? 'Are you sure you want to permanently delete your citizen account? All your filed complaints, photos, and tracking history will be permanently deleted.'
        : user.role === 'EMPLOYEE'
        ? 'Are you sure you want to permanently delete your staff account? Your work orders will be unassigned and your officer profile will be removed.'
        : 'Are you sure you want to permanently delete your administrator account? This will permanently revoke your administrative access.';

    if (window.confirm(roleWarning + ' This action cannot be undone.')) {
      setDeleting(true);
      try {
        await deleteProfileApi();
        alert('Your profile and account have been permanently deleted.');
        onClose();
        logout();
      } catch (err) {
        alert('Failed to delete account: ' + (err.response?.data?.message || err.message));
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>My Profile</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Account settings and identity information
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Identity Card */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>{user.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>User ID: #{user.id}</div>
              </div>
              <span className="badge" style={{ ...roleBadgeStyle, padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600 }}>
                {roleLabel}
              </span>
            </div>

            <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Mail size={15} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)', width: '70px' }}>Email:</span>
                <strong style={{ color: '#fff' }}>{user.email}</strong>
              </div>

              {user.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Phone size={15} color="var(--primary)" />
                  <span style={{ color: 'var(--text-muted)', width: '70px' }}>Phone:</span>
                  <strong style={{ color: '#fff' }}>{user.phone}</strong>
                </div>
              )}

              {user.departmentName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Briefcase size={15} color="#38bdf8" />
                  <span style={{ color: 'var(--text-muted)', width: '70px' }}>Department:</span>
                  <strong style={{ color: '#38bdf8' }}>{user.departmentName}</strong>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <CheckCircle size={15} color="#10b981" />
                <span style={{ color: 'var(--text-muted)', width: '70px' }}>Status:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Active &amp; Verified</span>
              </div>
            </div>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem', color: '#f87171', fontWeight: 600 }}>
              <AlertTriangle size={18} />
              <span>Danger Zone: Account Deletion</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Permanently remove your profile credentials and personal records from the civic system. Once deleted, your account cannot be recovered.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDeleteAccount}
              disabled={deleting}
              style={{
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              <Trash2 size={16} />
              {deleting ? 'Deleting Account...' : 'Delete My Account Permanently'}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
