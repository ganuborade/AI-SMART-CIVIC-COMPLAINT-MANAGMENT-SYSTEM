import React, { useState, useEffect } from 'react';
import { getDepartmentsApi, getEmployeesApi, assignComplaintApi } from '../api';
import { X, UserCheck } from 'lucide-react';

export default function AssignModal({ complaint, isOpen, onClose, onAssigned }) {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      setNotes('Please inspect site and initiate prompt remedial work.');
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDept) {
      loadEmployees(selectedDept);
    } else {
      setEmployees([]);
    }
  }, [selectedDept]);

  const loadDepartments = async () => {
    try {
      const res = await getDepartmentsApi();
      setDepartments(res.data);
      if (res.data.length > 0) {
        // Pre-select AI suggested department if matching
        const suggested = complaint?.aiAnalysis?.suggestedDepartment;
        const match = res.data.find(d => d.name.toLowerCase().includes(suggested?.toLowerCase() || ''));
        setSelectedDept(match ? match.id : res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadEmployees = async (deptId) => {
    try {
      const res = await getEmployeesApi(deptId);
      setEmployees(res.data);
      if (res.data.length > 0) {
        setSelectedEmp(res.data[0].id);
      } else {
        setSelectedEmp('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await assignComplaintApi(complaint.id, {
        departmentId: selectedDept,
        employeeId: selectedEmp || null,
        notes
      });
      onAssigned(res.data);
      onClose();
    } catch (err) {
      alert('Failed to assign complaint: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !complaint) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div>
            <h2>Dispatch & Assign Complaint</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Complaint #{complaint.id} • {complaint.title}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Assign Department *</label>
              <select
                className="form-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                required
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assign Field Officer</label>
              <select
                className="form-select"
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
              >
                <option value="">-- Assign to Department Pool (Unassigned Officer) --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.phone || 'Field Officer'})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dispatch Notes & Priority Instructions</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <UserCheck size={16} />
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
