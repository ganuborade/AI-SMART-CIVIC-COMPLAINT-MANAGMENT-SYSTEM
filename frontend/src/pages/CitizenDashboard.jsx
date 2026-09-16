import React, { useState, useEffect } from 'react';
import { getMyComplaintsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Clock, CheckCircle2, AlertTriangle, MapPin, Sparkles, Search, Filter } from 'lucide-react';

export default function CitizenDashboard({ onOpenNewComplaint, onSelectComplaint }) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await getMyComplaintsApi();
      setComplaints(res.data);
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

  return (
    <div>
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <h1>Welcome back, {user?.name || 'Citizen'}</h1>
          </div>
          <p className="page-subtitle">
            Report civic problems with photo and GPS location. AI will classify, prioritize, and route directly to municipality officers.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={onOpenNewComplaint}
          style={{ padding: '0.75rem 1.4rem', fontSize: '1rem' }}
        >
          <PlusCircle size={20} />
          Report New Problem
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total Reported</span>
            <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value">{total}</div>
          <div className="kpi-subtext">All time filed issues</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Pending Review</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-value">{pending}</div>
          <div className="kpi-subtext">Under AI &amp; Admin triage</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>In Progress</span>
            <div className="kpi-icon" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div className="kpi-value">{inProgress}</div>
          <div className="kpi-subtext">Field officers dispatched</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Resolved</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value">{resolved}</div>
          <div className="kpi-subtext">Successfully fixed &amp; closed</div>
        </div>
      </div>

      {/* Complaints List Section */}
      <div className="glass-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="panel-title">
            Your Civic Reports
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
              ({filtered.length} found)
            </span>
          </div>

          {/* Search and Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem 0.35rem 2rem', width: '180px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-select"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="ROAD_DAMAGE">Road Damage</option>
              <option value="WATER_LEAKAGE">Water Leakage</option>
              <option value="STREET_LIGHT">Street Light</option>
              <option value="GARBAGE_WASTE">Garbage Waste</option>
              <option value="DRAINAGE_OVERFLOW">Drainage Overflow</option>
            </select>

            <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
              <button
                className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilter('ALL')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                All ({total})
              </button>
              <button
                className={`tab-btn ${filter === 'ACTIVE' ? 'active' : ''}`}
                onClick={() => setFilter('ACTIVE')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Active ({pending + inProgress})
              </button>
              <button
                className={`tab-btn ${filter === 'RESOLVED' ? 'active' : ''}`}
                onClick={() => setFilter('RESOLVED')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Resolved ({resolved})
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
              <PlusCircle size={16} /> Report an Issue Now
            </button>
          </div>
        ) : (
          <div className="complaints-list">
            {filtered.map(c => (
              <div
                key={c.id}
                className="complaint-card"
                onClick={() => onSelectComplaint(c)}
              >
                <div className="card-top">
                  <div className="card-id-category">
                    <span className="complaint-id">#{c.id}</span>
                    <span className="category-tag">
                      {c.category?.replace('_', ' ')}
                    </span>
                    <span className={`badge badge-${c.priority?.toLowerCase()}`}>
                      {c.priority} Priority
                    </span>
                  </div>
                  <span className={`badge badge-status badge-${c.status}`}>
                    {c.status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="card-title">{c.title}</div>
                <div className="card-desc">{c.description}</div>

                <div className="card-footer">
                  <div className="card-loc">
                    <MapPin size={14} />
                    <span>{c.address || 'Reported on Map'}</span>
                  </div>

                  <div className="ai-meta">
                    {c.aiConfidence && (
                      <span>
                        <Sparkles size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        AI Confidence {Math.round(c.aiConfidence * 100)}%
                      </span>
                    )}
                    <span>• {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
