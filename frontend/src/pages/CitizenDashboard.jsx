import React, { useState, useEffect } from 'react';
import { getMyComplaintsApi, deleteProfileApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import CityMap from '../components/CityMap';
import { PlusCircle, Clock, CheckCircle2, AlertTriangle, MapPin, Sparkles, Search, Filter, Table, Map, Image, Eye, Star, BookOpen, Trash2, CheckCircle } from 'lucide-react';

export default function CitizenDashboard({ onOpenNewComplaint, onSelectComplaint }) {
  const { user, logout } = useAuth();
  const { t } = useUI();
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'map' | 'proof'

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await getMyComplaintsApi();
      setComplaints(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const total = complaints.length;
  const inProgress = complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
  const pending = complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'AI_ANALYZED' || c.status === 'UNDER_REVIEW').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  const filtered = complaints.filter(c => {
    if (filter === 'ACTIVE' && (c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'REJECTED')) return false;
    if (filter === 'RESOLVED' && (c.status !== 'RESOLVED' && c.status !== 'CLOSED')) return false;
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = c.id?.toString().includes(q);
      const titleMatch = c.title?.toLowerCase().includes(q);
      const descMatch = c.description?.toLowerCase().includes(q);
      const addrMatch = c.address?.toLowerCase().includes(q);
      if (!idMatch && !titleMatch && !descMatch && !addrMatch) return false;
    }

    return true;
  });

  const resolvedWithProof = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED');

  const handleDeleteAccount = async () => {
    if (window.confirm(t('deleteAccountConfirm') || 'Are you sure you want to permanently delete your citizen account? All your filed complaints and profile data will be permanently deleted. This cannot be undone.')) {
      try {
        await deleteProfileApi();
        alert('Your citizen account has been permanently deleted.');
        logout();
      } catch (err) {
        alert('Failed to delete account: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="page-title">
            <h1>{t('welcomeBack')}, {user?.name || t('citizen')}</h1>
          </div>
          <p className="page-subtitle">
            Report municipal civic problems with real-time GPS coordinates and photo evidence. AI instantly triages and routes to ward engineers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setViewMode('manual')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={16} />
            {t('citizenManual')}
          </button>
          <button
            className="btn btn-primary"
            onClick={onOpenNewComplaint}
            style={{ padding: '0.75rem 1.4rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={18} />
            {t('reportProblem')}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleDeleteAccount}
            title={t('deleteAccount')}
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={16} />
            <span style={{ fontSize: '0.85rem' }}>{t('deleteAccount')}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => setFilter('ALL')} style={{ cursor: 'pointer' }}>
          <div className="kpi-card-header">
            <span>{t('totalReported')}</span>
            <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value">{total}</div>
          <div className="kpi-subtext">{t('allTimeIssues')}</div>
        </div>

        <div className="kpi-card" onClick={() => setFilter('ACTIVE')} style={{ cursor: 'pointer' }}>
          <div className="kpi-card-header">
            <span>{t('pendingReview')}</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-value">{pending}</div>
          <div className="kpi-subtext">{t('underAiTriage')}</div>
        </div>

        <div className="kpi-card" onClick={() => setFilter('ACTIVE')} style={{ cursor: 'pointer' }}>
          <div className="kpi-card-header">
            <span>{t('inProgress')}</span>
            <div className="kpi-icon" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div className="kpi-value">{inProgress}</div>
          <div className="kpi-subtext">{t('fieldDispatched')}</div>
        </div>

        <div className="kpi-card" onClick={() => setFilter('RESOLVED')} style={{ cursor: 'pointer' }}>
          <div className="kpi-card-header">
            <span>{t('resolved')}</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value">{resolved}</div>
          <div className="kpi-subtext">{t('fixedAndClosed')}</div>
        </div>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="panel-title" style={{ marginBottom: 0 }}>
              Civic Complaint Explorer
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
                ({filtered.length} items)
              </span>
            </div>

            {/* View Mode Toggle: Table, Map, Proof */}
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <button
                type="button"
                className={`tab-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Data Table View"
              >
                <Table size={13} /> Table
              </button>
              <button
                type="button"
                className={`tab-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Live Map View"
              >
                <Map size={13} /> City Map
              </button>
              <button
                type="button"
                className={`tab-btn ${viewMode === 'proof' ? 'active' : ''}`}
                onClick={() => setViewMode('proof')}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Resolution Evidence & Feedback"
              >
                <Image size={13} /> Proofs ({resolvedWithProof.length})
              </button>
              <button
                type="button"
                className={`tab-btn ${viewMode === 'manual' ? 'active' : ''}`}
                onClick={() => setViewMode('manual')}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Citizen Operating Manual"
              >
                <BookOpen size={13} /> Guide
              </button>
            </div>
          </div>

          {/* Search and Category Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem 0.35rem 2rem', width: '200px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-select"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">{t('allCategories')}</option>
              <option value="ROAD_DAMAGE">{t('ROAD_DAMAGE')}</option>
              <option value="WATER_LEAKAGE">{t('WATER_LEAKAGE')}</option>
              <option value="STREET_LIGHT">{t('STREET_LIGHT')}</option>
              <option value="GARBAGE_WASTE">{t('GARBAGE_WASTE')}</option>
              <option value="DRAINAGE_OVERFLOW">{t('DRAINAGE_OVERFLOW')}</option>
            </select>

            <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
              <button
                className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilter('ALL')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                {t('all')} ({total})
              </button>
              <button
                className={`tab-btn ${filter === 'ACTIVE' ? 'active' : ''}`}
                onClick={() => setFilter('ACTIVE')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                {t('active')} ({pending + inProgress})
              </button>
              <button
                className={`tab-btn ${filter === 'RESOLVED' ? 'active' : ''}`}
                onClick={() => setFilter('RESOLVED')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                {t('resolved')} ({resolved})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading complaints...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>No complaints found matching your search or filters.</p>
            <button className="btn btn-primary btn-sm" onClick={onOpenNewComplaint}>
              <PlusCircle size={16} /> {t('reportProblem')}
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* TAB 1: Detailed Complaints Data Table */
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tableId')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tableTitle')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tableCategory')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tablePriority')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tableLocation')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>AI Triage</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tableStatus')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tableDate')}</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{t('tableAction')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectComplaint(c)}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>#{c.id}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.title}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="category-tag" style={{ fontSize: '0.72rem' }}>
                        {t(c.category) || c.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge badge-${c.priority?.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>
                        {t(c.priority) || c.priority}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {c.address || `${c.latitude.toFixed(3)}, ${c.longitude.toFixed(3)}`}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {c.aiConfidence ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue, #38bdf8)' }}>
                          <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
                          {Math.round(c.aiConfidence * 100)}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge badge-status badge-${c.status}`} style={{ fontSize: '0.72rem' }}>
                        {t(c.status) || c.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => { e.stopPropagation(); onSelectComplaint(c); }}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={12} /> {t('viewDetails')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : viewMode === 'map' ? (
          /* TAB 2: Live City Problem Map */
          <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Interactive live city map displaying geographical cluster of your reported problems. Click any marker to view issue details.
            </div>
            <CityMap
              complaints={filtered}
              onSelectComplaint={onSelectComplaint}
              height="480px"
              zoom={13}
            />
          </div>
        ) : viewMode === 'proof' ? (
          /* TAB 3: Resolved Work & Proof Gallery */
          <div style={{ padding: '1rem' }}>
            {resolvedWithProof.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No completed resolutions with photo evidence yet.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {resolvedWithProof.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onSelectComplaint(c)}
                    className="card"
                    style={{ cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>#{c.id} • RESOLVED</span>
                      <span className="badge badge-resolved">Verified Proof</span>
                    </div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                      {c.title}
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      <MapPin size={13} style={{ display: 'inline', marginRight: '3px' }} />
                      {c.address}
                    </div>
                    {c.images && c.images.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {c.images.slice(0, 2).map((img, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            <img
                              src={img.imageUrl}
                              alt={img.imageType}
                              style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', padding: '2px 4px', borderRadius: '3px' }}>
                              {img.imageType}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Field engineer reported repair completion on site.</div>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
                    >
                      <Eye size={13} /> Inspect Resolution Dossier
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TAB 4: Dedicated Citizen User Manual */
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', color: '#34d399' }}>
              <CheckCircle size={24} />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Citizen Operating Guide: Reporting &amp; Tracking Issues</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Step-by-step instructions for submitting grievances, checking live status, and scoring municipal response.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  1. Real-Time GPS Detection
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Click <strong>Report Civic Issue</strong> in the header. Click <strong>Detect Live GPS Location</strong> to automatically capture your real-time latitude/longitude and auto-populate your verified street address.
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  2. Attach Photo Evidence
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Upload clear photographic proof of the issue (pothole, water pipeline leak, broken streetlight). Multimodal AI verifies the severity and assigns priority.
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  3. Track Progress across 3 Views
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Use the <strong>Table</strong>, <strong>City Map</strong>, or <strong>Proofs Gallery</strong> to track lifecycle transitions: <code>SUBMITTED</code> &rarr; <code>UNDER_REVIEW</code> &rarr; <code>ASSIGNED</code> &rarr; <code>IN_PROGRESS</code> &rarr; <code>RESOLVED</code>.
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  4. Inspect Proof &amp; Submit Star Rating
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  When the municipal team completes repairs, view their on-site photographic proof in the dossier and submit a 1 to 5 star rating with feedback.
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  5. Privacy &amp; Profile Control
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  You can permanently delete your citizen profile and all submitted data at any time by clicking the <strong>Delete My Account</strong> button in the top right.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
