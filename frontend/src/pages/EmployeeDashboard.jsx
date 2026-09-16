import React, { useState, useEffect } from 'react';
import { getEmployeeComplaintsApi, startWorkApi, resolveComplaintMultipartApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { HardHat, Play, CheckCircle2, UploadCloud, MapPin, Sparkles, X, Eye, Search, Filter } from 'lucide-react';

export default function EmployeeDashboard({ onSelectComplaint }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [resolveTask, setResolveTask] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [afterImage, setAfterImage] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getEmployeeComplaintsApi();
      setTasks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (taskId) => {
    try {
      const res = await startWorkApi(taskId);
      setTasks(tasks.map(t => t.id === taskId ? res.data : t));
      alert('Work started! Status updated to IN_PROGRESS and citizen has been notified.');
    } catch (err) {
      alert('Failed to start work: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolveNotes.trim()) {
      alert('Please enter resolution notes describing the work done.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('notes', resolveNotes);
      if (afterImage) {
        formData.append('afterImage', afterImage);
      }

      const res = await resolveComplaintMultipartApi(resolveTask.id, formData);
      setTasks(tasks.map(t => t.id === resolveTask.id ? res.data : t));
      setResolveTask(null);
      setResolveNotes('');
      setAfterImage(null);
      setAfterPreview(null);
      alert('Great job! Complaint marked as RESOLVED and proof has been recorded.');
    } catch (err) {
      alert('Failed to resolve complaint: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED');
  const completedTasks = tasks.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');

  const filteredTasks = tasks.filter(t => {
    if (statusFilter === 'ASSIGNED' && t.status !== 'ASSIGNED') return false;
    if (statusFilter === 'IN_PROGRESS' && t.status !== 'IN_PROGRESS') return false;
    if (statusFilter === 'RESOLVED' && (t.status !== 'RESOLVED' && t.status !== 'CLOSED')) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = t.id?.toString().includes(q);
      const titleMatch = t.title?.toLowerCase().includes(q);
      const descMatch = t.description?.toLowerCase().includes(q);
      const addrMatch = t.address?.toLowerCase().includes(q);
      if (!idMatch && !titleMatch && !descMatch && !addrMatch) return false;
    }

    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <h1>Field Dispatch Workspace</h1>
          </div>
          <p className="page-subtitle">
            Welcome, <strong>{user?.name}</strong> • Assigned to <strong>{user?.departmentName || 'Civic Operations'}</strong>
          </p>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total Assigned</span>
            <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <HardHat size={20} />
            </div>
          </div>
          <div className="kpi-value">{tasks.length}</div>
          <div className="kpi-subtext">Department service pool</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Pending Action</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
              <Play size={20} />
            </div>
          </div>
          <div className="kpi-value">{activeTasks.length}</div>
          <div className="kpi-subtext">Require on-site execution</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Resolved by Team</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value">{completedTasks.length}</div>
          <div className="kpi-subtext">Fixed with photo evidence</div>
        </div>
      </div>

      {/* Task Queue */}
      <div className="glass-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="panel-title">
            <HardHat size={20} color="var(--primary)" />
            Active Field Work Orders
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
              ({filteredTasks.length} matching)
            </span>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search work orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem 0.35rem 2rem', width: '180px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-select"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
              <button
                className={`tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                All ({tasks.length})
              </button>
              <button
                className={`tab-btn ${statusFilter === 'ASSIGNED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ASSIGNED')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Assigned ({tasks.filter(t => t.status === 'ASSIGNED').length})
              </button>
              <button
                className={`tab-btn ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
                onClick={() => setStatusFilter('IN_PROGRESS')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                In Progress ({tasks.filter(t => t.status === 'IN_PROGRESS').length})
              </button>
              <button
                className={`tab-btn ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('RESOLVED')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Resolved ({completedTasks.length})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading assignments...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            No work orders match the current filter.
          </div>
        ) : (
          <div className="complaints-list">
            {filteredTasks.map(t => (
              <div key={t.id} className="complaint-card" style={{ cursor: 'default' }}>
                <div className="card-top">
                  <div className="card-id-category">
                    <span className="complaint-id">#{t.id}</span>
                    <span className={`badge badge-${t.priority?.toLowerCase()}`}>
                      {t.priority}
                    </span>
                    <span className="category-tag">
                      {t.category?.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`badge badge-status badge-${t.status}`}>
                    {t.status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="card-title">{t.title}</div>
                <div className="card-desc">{t.description}</div>

                <div className="card-footer" style={{ marginTop: '0.25rem' }}>
                  <div className="card-loc">
                    <MapPin size={14} />
                    <span>{t.address || 'Reported Location'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectComplaint(t)}
                    >
                      <Eye size={14} /> View Dossier
                    </button>

                    {t.status === 'ASSIGNED' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStartWork(t.id)}
                      >
                        <Play size={14} /> Start Work
                      </button>
                    )}

                    {t.status === 'IN_PROGRESS' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => setResolveTask(t)}
                      >
                        <CheckCircle2 size={14} /> Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolveTask && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div>
                <h2>Complete Resolution Proof</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Complaint #{resolveTask.id} • {resolveTask.title}
                </p>
              </div>
              <button onClick={() => setResolveTask(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Resolution Summary &amp; Work Description *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe how the problem was resolved (e.g., asphalt patch filled and leveled, leak sealed with collar pipe, streetlight bulb replaced)..."
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Upload AFTER Proof Photo (Required for Verification)</label>
                  <label className="dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAfterImage(file);
                          setAfterPreview(URL.createObjectURL(file));
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <UploadCloud size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {afterImage ? afterImage.name : 'Select or drop AFTER completion photo'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Photo showing the repaired road, fixed pipe, or illuminated street
                    </div>
                  </label>
                </div>

                {afterPreview && (
                  <div>
                    <img
                      src={afterPreview}
                      alt="After Proof"
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid #10b981' }}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setResolveTask(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={submitting}>
                  <CheckCircle2 size={16} />
                  {submitting ? 'Submitting Resolution...' : 'Submit Resolution Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
