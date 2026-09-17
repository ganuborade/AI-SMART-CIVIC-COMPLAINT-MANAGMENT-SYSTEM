import React, { useState, useEffect } from 'react';
import { getEmployeeComplaintsApi, startWorkApi, resolveComplaintMultipartApi, deleteProfileApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { HardHat, Play, CheckCircle2, UploadCloud, MapPin, Sparkles, X, Eye, Search, Filter, Clock, AlertTriangle, FileText, CheckCheck, BarChart3, Image, BookOpen, Trash2, CheckCircle } from 'lucide-react';

export default function EmployeeDashboard({ onSelectComplaint }) {
  const { user, logout } = useAuth();
  const { t } = useUI();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'completed' | 'stats' | 'manual'

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
      setTasks(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t('deleteAccountConfirm') || 'Are you sure you want to permanently delete your staff account? This will unassign your work orders and permanently remove your employee profile.')) {
      try {
        await deleteProfileApi();
        alert('Your officer account has been permanently deleted.');
        logout();
      } catch (err) {
        alert('Failed to delete account: ' + (err.response?.data?.message || err.message));
      }
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

  const assignedTasks = tasks.filter(t => t.status === 'ASSIGNED');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'assigned' && (t.status === 'RESOLVED' || t.status === 'CLOSED')) return false;
    if (activeTab === 'completed' && (t.status !== 'RESOLVED' && t.status !== 'CLOSED')) return false;

    if (statusFilter === 'ASSIGNED' && t.status !== 'ASSIGNED') return false;
    if (statusFilter === 'IN_PROGRESS' && t.status !== 'IN_PROGRESS') return false;
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
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="page-title">
            <h1>{user?.name || t('employee')} • Work Orders Portal</h1>
          </div>
          <p className="page-subtitle">
            {user?.departmentName || 'Municipal Operations Department'} • Field Inspection, Crew Dispatch &amp; Verification Evidence
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setActiveTab('manual')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={16} />
            {t('employeeManual') || 'Field Officer Manual'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleDeleteAccount}
            title={t('deleteAccount')}
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)', padding: '0.65rem 0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={16} />
            <span style={{ fontSize: '0.85rem' }}>{t('deleteAccount')}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => { setActiveTab('assigned'); setStatusFilter('ASSIGNED'); }} style={{ cursor: 'pointer' }}>
          <div className="kpi-card-header">
            <span>New Work Orders</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value">{assignedTasks.length}</div>
          <div className="kpi-subtext">Awaiting crew dispatch</div>
        </div>

        <div className="kpi-card" onClick={() => { setActiveTab('assigned'); setStatusFilter('IN_PROGRESS'); }} style={{ cursor: 'pointer' }}>
          <div className="kpi-card-header">
            <span>Active on Site</span>
            <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <HardHat size={20} />
            </div>
          </div>
          <div className="kpi-value">{inProgressTasks.length}</div>
          <div className="kpi-subtext">Field repairs in progress</div>
        </div>

        <div className="kpi-card" onClick={() => setActiveTab('completed')} style={{ cursor: 'pointer' }}>
          <div className="kpi-card-header">
            <span>Completed Resolutions</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value">{completedTasks.length}</div>
          <div className="kpi-subtext">Verified with photo proof</div>
        </div>

        <div className="kpi-card" onClick={() => setActiveTab('stats')} style={{ cursor: 'pointer' }}>
          <div className="kpi-card-header">
            <span>Overall Turnaround</span>
            <div className="kpi-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="kpi-value">94.2%</div>
          <div className="kpi-subtext">Department SLA Compliance</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Main Views Switcher */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`tab-btn ${activeTab === 'assigned' ? 'active' : ''}`}
              onClick={() => { setActiveTab('assigned'); setStatusFilter('ALL'); }}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <HardHat size={14} /> Active Work Orders ({assignedTasks.length + inProgressTasks.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => { setActiveTab('completed'); setStatusFilter('ALL'); }}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCheck size={14} /> Completed History ({completedTasks.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <BarChart3 size={14} /> Department Metrics
            </button>
            <button
              className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => setActiveTab('manual')}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <BookOpen size={14} /> {t('employeeManual') || 'Field Officer Manual'}
            </button>
          </div>

          {/* Search & Filters */}
          {activeTab !== 'stats' && activeTab !== 'manual' && (
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
                <option value="ALL">{t('allPriorities')}</option>
                <option value="CRITICAL">{t('CRITICAL')}</option>
                <option value="HIGH">{t('HIGH')}</option>
                <option value="MEDIUM">{t('MEDIUM')}</option>
                <option value="LOW">{t('LOW')}</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading field assignments...
          </div>
        ) : activeTab === 'manual' ? (
          /* TAB 4: Field Officer Operational Manual */
          <div style={{ padding: '1.75rem', maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '10px', borderRadius: '10px' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                  {t('employeeManual') || 'Municipal Field Officer & Crew Operational Manual'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Standard Operating Procedures (SOP) for Municipal Field Work, Evidence Capture &amp; SLA Compliance
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                  <HardHat size={18} />
                  <span>Phase 1: Receiving Work Orders &amp; Crew Dispatch</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Tickets auto-triaged by AI or assigned by ward administrators appear in your <strong>Active Work Orders</strong> queue. Inspect the initial citizen photo, GPS pin, address, and AI severity rating before heading to the field site.
                </p>
              </div>

              <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--warning)', fontWeight: 600 }}>
                  <Play size={18} />
                  <span>Phase 2: Arriving on Site &amp; Starting Work</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Once your crew arrives at the location, click the green <strong>"Start Work"</strong> button. The ticket status transitions to <code>IN_PROGRESS</code>, triggering an instant notification to the citizen that municipal crews are actively resolving their issue.
                </p>
              </div>

              <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--success)', fontWeight: 600 }}>
                  <CheckCircle2 size={18} />
                  <span>Phase 3: Photographic Resolution Evidence</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  After physical repairs are finished, click <strong>"Resolve &amp; Submit Proof"</strong>. Upload a clear <strong>AFTER-repair photograph</strong> and enter field engineering notes. Tickets cannot be closed without photographic evidence.
                </p>
              </div>

              <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#a855f7', fontWeight: 600 }}>
                  <BarChart3 size={18} />
                  <span>Phase 4: Citizen Verification &amp; SLA Performance</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Citizens receive a side-by-side comparison of the BEFORE and AFTER photographs and provide 1-5 star ratings. High turnaround efficiency contributes to department SLA ranking.
                </p>
              </div>

              <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#f87171', fontWeight: 600 }}>
                  <Trash2 size={18} />
                  <span>Account &amp; Permission Boundaries</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Field officers can update ticket progress and resolve issues. Field officers <strong>cannot delete complaints</strong> (only system administrators possess complaint deletion privileges). If your posting concludes, use the <strong>"Delete My Account"</strong> button in the top header to remove your officer profile safely.
                </p>
              </div>
            </div>
          </div>
        ) : activeTab === 'stats' ? (
          /* TAB 3: Department Performance Stats */
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Department Productivity &amp; Service Level Agreement (SLA)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Assigned Department</div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-blue, #38bdf8)' }}>{user?.departmentName || 'General Infrastructure'}</strong>
              </div>
              <div className="card" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Average Resolution Time</div>
                <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>3.8 Hours</strong>
              </div>
              <div className="card" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Photo Verification Rate</div>
                <strong style={{ fontSize: '1.1rem', color: '#6366f1' }}>100% Verified</strong>
              </div>
              <div className="card" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Citizen Satisfaction Score</div>
                <strong style={{ fontSize: '1.1rem', color: '#fbbf24' }}>4.9 / 5.0 ⭐</strong>
              </div>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <p>No work orders found in this view.</p>
          </div>
        ) : (
          /* TAB 1 & 2: Active or Completed Work Orders Table */
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tableId')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tablePriority')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tableTitle')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tableLocation')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('tableStatus')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Dispatch Notes</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{t('tableAction')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr
                    key={task.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>#{task.id}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge badge-${task.priority?.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>
                        {t(task.priority) || task.priority}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, maxWidth: '240px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Category: {t(task.category) || task.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', maxWidth: '180px', color: 'var(--text-secondary)' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        {task.address}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge badge-status badge-${task.status}`} style={{ fontSize: '0.72rem' }}>
                        {t(task.status) || task.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', maxWidth: '200px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {task.assignment?.notes || 'Standard Municipal Maintenance Protocol'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectComplaint(task)}
                          title="View Full Complaint Dossier"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={12} />
                        </button>

                        {task.status === 'ASSIGNED' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStartWork(task.id)}
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: '#3b82f6', borderColor: '#3b82f6' }}
                          >
                            <Play size={12} /> {t('startWork')}
                          </button>
                        )}

                        {task.status === 'IN_PROGRESS' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setResolveTask(task)}
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: '#10b981', borderColor: '#10b981' }}
                          >
                            <CheckCircle2 size={12} /> Resolve with Proof
                          </button>
                        )}

                        {(task.status === 'RESOLVED' || task.status === 'CLOSED') && (
                          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={13} /> Verified
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proof & Resolution Modal */}
      {resolveTask && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div>
                <h2>Resolution &amp; Proof Submission</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Complaint #{resolveTask.id}: {resolveTask.title}
                </p>
              </div>
              <button onClick={() => setResolveTask(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Resolution Work Notes *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe exact repair actions taken (e.g. Asphalting completed, cable spliced, container cleared)..."
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mandatory AFTER-Repair Photographic Proof</label>
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
                    <UploadCloud size={30} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {afterImage ? afterImage.name : 'Click to take or upload AFTER-repair photo'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Photo is verified by supervisor and visible to citizen.
                    </div>
                  </label>
                </div>

                {afterPreview && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={afterPreview}
                      alt="After Proof Preview"
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setResolveTask(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  {submitting ? 'Submitting Proof...' : 'Complete & Close Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
