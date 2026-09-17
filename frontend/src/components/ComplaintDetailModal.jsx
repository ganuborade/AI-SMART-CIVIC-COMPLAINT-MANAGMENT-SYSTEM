import React, { useState } from 'react';
import { addFeedbackApi, deleteComplaintApi } from '../api';
import { useAuth } from '../context/AuthContext';
import CityMap from './CityMap';
import { X, Sparkles, MapPin, Calendar, User, Clock, Star, CheckCircle, AlertTriangle, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function ComplaintDetailModal({ complaint, isOpen, onClose, onUpdated, currentUserId }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  if (!isOpen || !complaint) return null;

  const isCitizenOwner = currentUserId && complaint.citizenId === currentUserId;
  const isResolved = complaint.status === 'RESOLVED' || complaint.status === 'CLOSED';
  const hasFeedback = !!complaint.feedback;

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    try {
      const res = await addFeedbackApi(complaint.id, rating, feedbackComment);
      if (onUpdated) onUpdated(res.data);
      alert('Thank you! Your feedback has been registered and complaint is now officially closed.');
    } catch (err) {
      alert('Failed to submit feedback: ' + (err.response?.data?.message || err.message));
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleDeleteComplaint = async () => {
    if (window.confirm(`Are you sure you want to permanently delete Complaint #${complaint.id}? This will remove all associated images, status history, and feedback. This action cannot be undone.`)) {
      try {
        await deleteComplaintApi(complaint.id);
        alert(`Complaint #${complaint.id} deleted successfully.`);
        if (onClose) onClose();
        if (onUpdated) onUpdated({ id: complaint.id, deleted: true });
      } catch (err) {
        alert('Failed to delete complaint: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const beforeImage = complaint.images?.find(i => i.imageType === 'BEFORE')?.imageUrl;
  const afterImage = complaint.images?.find(i => i.imageType === 'AFTER')?.imageUrl;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '780px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="complaint-id">#{complaint.id}</span>
              <span className={`badge badge-${complaint.priority?.toLowerCase()}`}>
                {complaint.priority} Priority
              </span>
              <span className={`badge badge-status badge-${complaint.status}`}>
                {complaint.status?.replace('_', ' ')}
              </span>
            </div>
            <h2 style={{ marginTop: '0.35rem' }}>{complaint.title}</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Description */}
          <div>
            <div className="form-label" style={{ marginBottom: '4px' }}>Citizen Description</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              {complaint.description}
            </p>
          </div>

          {/* AI Recommendation Box */}
          {complaint.aiAnalysis && (
            <div className="ai-insight-box">
              <div className="ai-insight-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={15} /> AI System Recommendation
                </span>
                <span style={{ color: '#67e8f9', fontWeight: 600 }}>
                  Confidence: {Math.round((complaint.aiAnalysis.confidence || 0.9) * 100)}%
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong>AI Summary:</strong> {complaint.aiAnalysis.summary}
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Suggested Dept: <strong style={{ color: '#fff' }}>{complaint.aiAnalysis.suggestedDepartment}</strong></span>
                <span>Category: <strong style={{ color: '#fff' }}>{complaint.aiAnalysis.category}</strong></span>
              </div>
              {complaint.aiAnalysis.duplicateOfId && (
                <div style={{ fontSize: '0.8rem', color: '#fbbf24', background: 'rgba(245,158,11,0.1)', padding: '0.4rem', borderRadius: '4px' }}>
                  ⚠️ Notice: Matched as duplicate of Complaint #{complaint.aiAnalysis.duplicateOfId} ({complaint.aiAnalysis.duplicateTitle})
                </div>
              )}
            </div>
          )}

          {/* Photo Evidence Side-by-Side (BEFORE & AFTER) */}
          {(beforeImage || afterImage) && (
            <div>
              <div className="form-label" style={{ marginBottom: '8px' }}>Visual Evidence Proof</div>
              <div className="image-comparison">
                {beforeImage && (
                  <div className="photo-preview">
                    <span className="photo-label">Before Resolution (Citizen Upload)</span>
                    <img src={beforeImage} alt="Before" className="photo-img" />
                  </div>
                )}
                {afterImage && (
                  <div className="photo-preview">
                    <span className="photo-label" style={{ color: '#34d399' }}>After Resolution (Field Officer Proof)</span>
                    <img src={afterImage} alt="After" className="photo-img" style={{ borderColor: '#10b981' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location & Mini Map */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              <MapPin size={16} color="var(--primary)" />
              <strong style={{ fontSize: '0.9rem' }}>{complaint.address || 'Reported Location'}</strong>
            </div>
            {complaint.latitude && complaint.longitude && (
              <CityMap
                height="180px"
                selectedComplaint={complaint}
                zoom={14}
              />
            )}
          </div>

          {/* Chronological Status Lifecycle Stepper */}
          <div>
            <div className="form-label">Lifecycle Status History</div>
            <div className="timeline">
              {complaint.statusHistory?.map((step, idx) => (
                <div key={step.id || idx} className={`timeline-step ${idx === complaint.statusHistory.length - 1 ? 'active' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-header">
                    <span>{step.newStatus?.replace('_', ' ')}</span>
                    <span className="timeline-time">
                      {step.changedAt ? new Date(step.changedAt).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                  <div className="timeline-comment">{step.comment}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Action by: {step.changedByName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          {hasFeedback && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 700, color: '#34d399' }}>Citizen Rating:</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={16}
                      fill={star <= complaint.feedback.rating ? '#fbbf24' : 'transparent'}
                      color="#fbbf24"
                    />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                "{complaint.feedback.comments || 'Resolution accepted.'}"
              </p>
            </div>
          )}

          {!hasFeedback && isResolved && isCitizenOwner && (
            <form onSubmit={handleFeedbackSubmit} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle size={16} color="#10b981" /> Rate Resolution & Close Complaint
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Satisfaction Rating</label>
                <div style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      style={{ background: 'none', border: 'none', padding: '2px' }}
                    >
                      <Star
                        size={22}
                        fill={s <= rating ? '#fbbf24' : 'transparent'}
                        color="#fbbf24"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Feedback Comment</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="How was the municipal response speed and quality?"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-success btn-sm" disabled={feedbackLoading}>
                {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {user?.role === 'ADMIN' && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDeleteComplaint}
                style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={16} />
                Delete Complaint (Admin Only)
              </button>
            )}
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
