import React, { useState, useEffect } from 'react';
import {
  getComplaintsApi,
  getAdminStatsApi,
  overrideAIApi,
  rejectComplaintApi,
  getDepartmentStatsApi,
  createDepartmentApi,
  getAllUsersApi,
  deleteComplaintApi,
  deleteUserApi,
  deleteProfileApi
} from '../api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import CityMap from '../components/CityMap';
import AssignModal from '../components/AssignModal';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MapPin,
  Sparkles,
  UserCheck,
  Edit3,
  XCircle,
  Eye,
  Layers,
  Search,
  Download,
  Building2,
  Users,
  Phone,
  Mail,
  Plus,
  X,
  Map,
  Key,
  BookOpen,
  Trash2
} from 'lucide-react';

export default function AdminDashboard({ onSelectComplaint }) {
  const { user, logout } = useAuth();
  const { t } = useUI();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'departments' | 'users' | 'map' | 'manual'

  const [selectedForAssign, setSelectedForAssign] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Add Department Modal
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptIcon, setDeptIcon] = useState('Building2');
  const [deptHead, setDeptHead] = useState('');
  const [deptEmail, setDeptEmail] = useState('');
  const [deptPhone, setDeptPhone] = useState('');
  const [deptSaving, setDeptSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, statRes, deptRes, userRes] = await Promise.all([
        getComplaintsApi(),
        getAdminStatsApi(),
        getDepartmentStatsApi(),
        getAllUsersApi().catch(() => ({ data: [] }))
      ]);
      setComplaints(compRes.data || []);
      setStats(statRes.data || null);
      setDeptStats(deptRes.data || []);
      setUsers(userRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideAI = async (complaint) => {
    const newPriority = prompt(
      `Override priority for Complaint #${complaint.id}?\nEnter LOW, MEDIUM, HIGH, or CRITICAL:`,
      complaint.priority
    );
    if (!newPriority) return;

    try {
      const res = await overrideAIApi(complaint.id, {
        priority: newPriority.toUpperCase(),
        reason: 'Admin manual priority adjustment'
      });
      setComplaints(complaints.map(c => c.id === complaint.id ? res.data : c));
      alert('Priority successfully updated.');
    } catch (err) {
      alert('Failed to override AI: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (complaint) => {
    const reason = prompt(`Reason for rejecting Complaint #${complaint.id}:`, 'Out of municipality jurisdiction');
    if (!reason) return;

    try {
      const res = await rejectComplaintApi(complaint.id, reason);
      setComplaints(complaints.map(c => c.id === complaint.id ? res.data : c));
      alert('Complaint has been marked as REJECTED.');
    } catch (err) {
      alert('Failed to reject: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteComplaint = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete Complaint #${id}? This will remove all associated images, status history, and feedback. This action is irreversible.`)) {
      try {
        await deleteComplaintApi(id);
        setComplaints(complaints.filter(c => c.id !== id));
        alert(`Complaint #${id} was permanently deleted.`);
      } catch (err) {
        alert('Failed to delete complaint: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to permanently delete your administrator account? This will permanently remove your administrator credentials.')) {
      try {
        await deleteProfileApi();
        alert('Your administrator account has been permanently deleted.');
        logout();
      } catch (err) {
        alert('Failed to delete account: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteUser = async (u) => {
    if (window.confirm(`Are you sure you want to permanently delete user #${u.id} (${u.name} - ${u.role})? This will permanently remove their user credentials and data.`)) {
      try {
        await deleteUserApi(u.id);
        setUsers(users.filter(item => item.id !== u.id));
        alert(`User #${u.id} (${u.name}) was permanently deleted.`);
      } catch (err) {
        alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setDeptSaving(true);
    try {
      await createDepartmentApi({
        name: deptName,
        description: deptDesc,
        icon: deptIcon,
        headName: deptHead,
        contactEmail: deptEmail,
        contactPhone: deptPhone
      });
      alert('Department created successfully!');
      setIsAddDeptModalOpen(false);
      setDeptName('');
      setDeptDesc('');
      setDeptHead('');
      setDeptEmail('');
      setDeptPhone('');
      const refreshed = await getDepartmentStatsApi();
      setDeptStats(refreshed.data);
    } catch (err) {
      alert('Failed to create department: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeptSaving(false);
    }
  };

  const exportToCsv = () => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Citizen Name', 'Citizen Phone', 'Address', 'Assigned Dept', 'Officer', 'Created At'];
    const rows = filtered.map(c => [
      c.id,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.status,
      `"${(c.citizenName || '').replace(/"/g, '""')}"`,
      `"${c.citizenPhone || ''}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${c.assignment?.departmentName || 'Unassigned'}"`,
      `"${c.assignment?.employeeName || 'None'}"`,
      new Date(c.createdAt).toLocaleString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civic_complaints_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = complaints.filter(c => {
    if (filterCategory !== 'ALL' && c.category !== filterCategory) return false;
    if (filterPriority !== 'ALL' && c.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = c.id?.toString().includes(q);
      const titleMatch = c.title?.toLowerCase().includes(q);
      const descMatch = c.description?.toLowerCase().includes(q);
      const addrMatch = c.address?.toLowerCase().includes(q);
      const citizenMatch = c.citizenName?.toLowerCase().includes(q);
      if (!idMatch && !titleMatch && !descMatch && !addrMatch && !citizenMatch) return false;
    }
    return true;
  });

  const filteredUsers = users.filter(u => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      const nameMatch = u.name?.toLowerCase().includes(q);
      const emailMatch = u.email?.toLowerCase().includes(q);
      const phoneMatch = u.phone?.toLowerCase().includes(q);
      const roleMatch = u.role?.toLowerCase().includes(q);
      const deptMatch = u.department?.name?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !phoneMatch && !roleMatch && !deptMatch) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <h1>Municipal Command Center</h1>
          </div>
          <p className="page-subtitle">
            Live AI automated complaint triage, spatial incident mapping, department dispatch, and priority overrides.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setActiveTab('manual')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={16} />
            {t('adminManual') || 'Administrator Manual'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={exportToCsv}
            title="Download CSV Incident Report"
          >
            <Download size={16} /> Export CSV Report
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
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total Complaints</span>
            <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <Layers size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats?.totalComplaints ?? complaints.length}</div>
          <div className="kpi-subtext">Across all civic sectors</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Pending Review</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats?.pendingReview ?? 0}</div>
          <div className="kpi-subtext">Require officer assignment</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Dispatched / Active</span>
            <div className="kpi-icon" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats?.inProgress ?? 0}</div>
          <div className="kpi-subtext">Crew deployed on site</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Resolved</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats?.resolved ?? 0}</div>
          <div className="kpi-subtext">Avg Rating: {stats?.avgResolutionRating ?? 4.8} / 5.0 ★</div>
        </div>

        <div className="kpi-card" style={{ borderColor: 'rgba(239, 68, 68, 0.5)' }}>
          <div className="kpi-card-header">
            <span style={{ color: '#f87171' }}>Critical Hazards</span>
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f87171' }}>{stats?.critical ?? 0}</div>
          <div className="kpi-subtext" style={{ color: '#fca5a5' }}>Immediate public safety threat</div>
        </div>
      </div>

      {/* Navigation Tab Bar with 4 Tables / Workspaces */}
      <div className="tabs-nav" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '6px' }}>
        <button
          className={`tab-btn ${activeTab === 'triage' ? 'active' : ''}`}
          onClick={() => setActiveTab('triage')}
        >
          <Sparkles size={16} /> Triage &amp; Complaints Table ({complaints.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          <Building2 size={16} /> Municipal Departments ({deptStats.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> Users &amp; Staff Directory ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <Map size={16} /> Live City Command Map
        </button>
        <button
          className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          <BookOpen size={16} /> {t('adminManual') || 'Administrator Manual'}
        </button>
      </div>

      {activeTab === 'map' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <MapPin size={20} color="var(--primary)" />
              Live City Command Center Incident Map
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> Road Damage
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7' }}></span> Water Leak
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span> Streetlight
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Garbage
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }}></span> Drainage
              </span>
            </div>
          </div>

          <CityMap
            complaints={complaints}
            onSelectComplaint={onSelectComplaint}
            height="500px"
          />
        </div>
      )}

      {activeTab === 'triage' && (
        <>
          {/* Triage Data Table */}
          <div className="glass-panel">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="panel-title">
                <Sparkles size={20} color="var(--primary)" />
                Complaint Triage &amp; Department Dispatch Queue
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
                  ({filtered.length} matching)
                </span>
              </div>

              {/* Search & Quick Filters Bar */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Real-time Search Input */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by ID, keyword, citizen, road..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem 0.35rem 2rem', width: '220px' }}
                  />
                  <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>

                <select
                  className="form-select"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="ROAD_DAMAGE">Road Damage</option>
                  <option value="WATER_LEAKAGE">Water Leakage</option>
                  <option value="STREET_LIGHT">Street Light</option>
                  <option value="GARBAGE_WASTE">Garbage Waste</option>
                  <option value="DRAINAGE_OVERFLOW">Drainage Overflow</option>
                </select>

                <select
                  className="form-select"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                <select
                  className="form-select"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>ID</th>
                    <th style={{ padding: '0.75rem' }}>Title &amp; Issue</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Priority</th>
                    <th style={{ padding: '0.75rem' }}>AI Suggestion</th>
                    <th style={{ padding: '0.75rem' }}>Assignment</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No complaints match your filters or search query.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(c => (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                          #{c.id}
                        </td>
                        <td style={{ padding: '0.75rem', maxWidth: '280px' }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{c.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.address}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                            Reported by: <strong>{c.citizenName}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className="badge badge-status">
                            {c.category?.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge badge-${c.priority?.toLowerCase()}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {c.aiAnalysis ? (
                            <div>
                              <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 600 }}>
                                {c.aiAnalysis.suggestedDepartment}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {Math.round((c.aiAnalysis.confidence || 0.9) * 100)}% Match
                              </div>
                              {c.aiAnalysis.duplicateOfId && (
                                <span style={{ fontSize: '0.65rem', color: '#fbbf24' }}>
                                  ⚠️ Dup of #{c.aiAnalysis.duplicateOfId}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Rule matched</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {c.assignment ? (
                            <div style={{ fontSize: '0.8rem' }}>
                              <div style={{ fontWeight: 600 }}>{c.assignment.departmentName}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {c.assignment.employeeName || 'Dept Pool'}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge badge-status badge-${c.status}`}>
                            {c.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="View Full Dossier"
                              onClick={() => onSelectComplaint(c)}
                            >
                              <Eye size={14} />
                            </button>

                            {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                              <button
                                className="btn btn-primary btn-sm"
                                title="Assign Department & Officer"
                                onClick={() => setSelectedForAssign(c)}
                              >
                                <UserCheck size={14} />
                              </button>
                            )}

                            <button
                              className="btn btn-secondary btn-sm"
                              title="Override AI Priority"
                              onClick={() => handleOverrideAI(c)}
                            >
                              <Edit3 size={14} />
                            </button>

                            {c.status !== 'REJECTED' && c.status !== 'RESOLVED' && (
                              <button
                                className="btn btn-secondary btn-sm"
                                title="Reject Complaint"
                                onClick={() => handleReject(c)}
                                style={{ color: '#f87171' }}
                              >
                                <XCircle size={14} />
                              </button>
                            )}

                            <button
                              className="btn btn-secondary btn-sm"
                              title="Delete Complaint (Admin Only)"
                              onClick={(e) => handleDeleteComplaint(c.id, e)}
                              style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'departments' && (
        /* Municipal Departments & Teams Workspace */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Civic Departments &amp; Workforce Overview</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Track departmental workloads, field engineer allocations, and SLA completion rates across Pune municipality.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setIsAddDeptModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Department
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {deptStats.map(d => (
              <div key={d.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Building2 size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{d.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dept Code: #{d.id}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', minHeight: '36px' }}>
                    {d.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                    {d.headName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} color="var(--primary)" />
                        <span>Head: <strong style={{ color: '#fff' }}>{d.headName}</strong></span>
                      </div>
                    )}
                    {d.contactEmail && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="var(--primary)" />
                        <span>{d.contactEmail}</span>
                      </div>
                    )}
                    {d.contactPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="var(--primary)" />
                        <span>{d.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Workload Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
                  padding: '0.75rem 0.5rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{d.totalComplaints}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning)' }}>{d.pendingComplaints}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c084fc' }}>{d.inProgressComplaints}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>{d.resolvedComplaints}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fixed</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        /* Municipal Identity & Staff Directory Workspace */
        <div>
          {/* Summary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{users.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Registered Accounts</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <UserCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)' }}>
                  {users.filter(u => u.role === 'CITIZEN').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Citizens</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>
                  {users.filter(u => u.role === 'EMPLOYEE').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Field Officers &amp; Staff</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                <Key size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--warning)' }}>
                  {users.filter(u => u.role === 'ADMIN').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Administrators</div>
              </div>
            </div>
          </div>

          {/* Users Directory Table */}
          <div className="glass-panel">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="panel-title">
                <Users size={20} color="var(--primary)" />
                Municipal Identity &amp; Staff Access Directory
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
                  ({filteredUsers.length} matching)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by name, email, phone, role..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem 0.35rem 2rem', width: '250px' }}
                  />
                  <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>

                <select
                  className="form-select"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  <option value="CITIZEN">Citizens</option>
                  <option value="EMPLOYEE">Employees / Field Engineers</option>
                  <option value="ADMIN">System Administrators</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>User ID</th>
                    <th style={{ padding: '0.75rem' }}>Full Name &amp; Contact</th>
                    <th style={{ padding: '0.75rem' }}>Role</th>
                    <th style={{ padding: '0.75rem' }}>Department / Wing</th>
                    <th style={{ padding: '0.75rem' }}>Passkey / Auth Status</th>
                    <th style={{ padding: '0.75rem' }}>Joined Date</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No user accounts match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                          #{u.id}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          {u.phone && (
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>📞 {u.phone}</div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span
                            className="badge"
                            style={{
                              background:
                                u.role === 'ADMIN'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : u.role === 'EMPLOYEE'
                                  ? 'rgba(2, 132, 199, 0.15)'
                                  : 'rgba(16, 185, 129, 0.15)',
                              color:
                                u.role === 'ADMIN'
                                  ? '#fbbf24'
                                  : u.role === 'EMPLOYEE'
                                  ? '#38bdf8'
                                  : '#34d399',
                              border: `1px solid ${
                                u.role === 'ADMIN'
                                  ? 'rgba(245, 158, 11, 0.3)'
                                  : u.role === 'EMPLOYEE'
                                  ? 'rgba(2, 132, 199, 0.3)'
                                  : 'rgba(16, 185, 129, 0.3)'
                              }`
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {u.department ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#c084fc' }}>
                              <Building2 size={13} /> {u.department.name}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Civic Public</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {u.role === 'ADMIN' || u.role === 'EMPLOYEE' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#38bdf8' }}>
                              <Key size={12} /> Passkey Protected
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Standard Citizen
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Delete User Account"
                            onClick={() => handleDeleteUser(u)}
                            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="glass-panel" style={{ padding: '1.75rem', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '10px', borderRadius: '10px' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                {t('adminManual') || 'Administrator Command Manual'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Master Municipal Control: AI Triage, Department Routing, Passkey Governance, Ticket Deletion &amp; Data Audits
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                <Sparkles size={18} />
                <span>1. AI-Powered Automated Triage &amp; Priority Overrides</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Every incoming citizen report is automatically evaluated using AI computer vision and NLP. Priority levels (<code>LOW</code>, <code>MEDIUM</code>, <code>HIGH</code>, <code>CRITICAL</code>) are assigned based on public safety hazards. Admins can click the <strong>Edit icon</strong> on any ticket row to override the AI-suggested priority with an official justification.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--accent-blue, #38bdf8)', fontWeight: 600 }}>
                <Building2 size={18} />
                <span>2. Department Dispatch &amp; Officer Work Orders</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Click the <strong>Assign icon</strong> to dispatch a ticket to a municipal department (e.g. Roads &amp; Bridges, Water Supply) and assign a specific field officer. The officer receives an instant push notification on their portal and the ticket status updates to <code>ASSIGNED</code>.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                <Download size={18} />
                <span>3. Real-Time Spatial Mapping &amp; CSV Intelligence Reports</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Switch to the <strong>Live City Command Map</strong> tab to view geospatial clustering of civic grievances across city wards. Click <strong>"Export CSV Report"</strong> at any time to generate an audit-ready municipal spreadsheet for council meetings and budget reviews.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#f87171', fontWeight: 600 }}>
                <Trash2 size={18} />
                <span>4. Exclusive Authority: Complaint &amp; Incident Record Deletion</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Only verified Administrators possess permission to delete complaints. Citizens and field employees are strictly prohibited from removing complaints. To delete duplicate, spam, or invalid tickets, click the red <strong>Trash icon</strong> on the triage table or inside the complaint dossier. All associated notifications and image links are cleanly cascaded.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#fbbf24', fontWeight: 600 }}>
                <Key size={18} />
                <span>5. Passkey Governance &amp; Account Self-Deletion</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Administrative and Officer registrations require secret passkeys defined in the system environment (never displayed in client interfaces). Administrators can also delete their own accounts via the <strong>"Delete Admin Account"</strong> button in the command header if transferring command.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {selectedForAssign && (
        <AssignModal
          complaint={selectedForAssign}
          isOpen={!!selectedForAssign}
          onClose={() => setSelectedForAssign(null)}
          onAssigned={(updated) => {
            setComplaints(complaints.map(c => c.id === updated.id ? updated : c));
          }}
        />
      )}

      {/* Add Department Modal */}
      {isAddDeptModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h2>Add Municipal Department</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Create a new civic division to route and manage city complaints
                </p>
              </div>
              <button onClick={() => setIsAddDeptModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Department Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Parks & Urban Greenery"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description &amp; Jurisdiction</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe issues managed by this department (e.g. fallen trees, garden maintenance, public playgrounds)..."
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department Head / Officer-in-Charge</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Sunil Khot"
                    value={deptHead}
                    onChange={(e) => setDeptHead(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Official Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="parks@civic.gov"
                      value={deptEmail}
                      onChange={(e) => setDeptEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Helpline</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="+91 20 2550 1106"
                      value={deptPhone}
                      onChange={(e) => setDeptPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddDeptModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={deptSaving}>
                  {deptSaving ? 'Saving...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
