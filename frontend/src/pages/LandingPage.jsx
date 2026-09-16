import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogIn,
  UserPlus,
  Zap,
  Droplets,
  Trash2,
  Waves,
  Building,
  Star,
  Users
} from 'lucide-react';
import { getComplaintsApi } from '../api';

export default function LandingPage({ onOpenAuth, onSelectComplaint }) {
  const [publicComplaints, setPublicComplaints] = useState([]);

  useEffect(() => {
    fetchPublicIssues();
  }, []);

  const fetchPublicIssues = async () => {
    try {
      const res = await getComplaintsApi();
      setPublicComplaints(res.data || []);
    } catch (e) {
      // Ignored if offline
    }
  };

  const resolvedIssues = publicComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED');

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '3.5rem 1rem 2.5rem',
        background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.18) 0%, rgba(15, 23, 42, 0) 70%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '3rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} />
          Next-Generation Municipal Grievance Redressal
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '1.2rem',
          color: '#ffffff'
        }}>
          AI-Powered Smart Civic <br />
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Complaint Management System
          </span>
        </h1>

        <p style={{
          maxWidth: '680px',
          margin: '0 auto 2.2rem',
          fontSize: '1.05rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6
        }}>
          Empowering citizens to report urban infrastructural issues with photo evidence and GPS coordinates.
          Multimodal AI automatically verifies damage, assigns priority, and dispatches work orders to municipal officers in real-time.
        </p>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => onOpenAuth('register')}
            style={{ padding: '0.85rem 1.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <UserPlus size={18} />
            Register as Citizen
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onOpenAuth('login')}
            style={{ padding: '0.85rem 1.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogIn size={18} />
            Sign In to Account
          </button>
        </div>

        {/* Access info */}
        <div style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          🔒 Secure Role-Based Access for <strong>Citizens</strong>, <strong>Department Officers</strong>, and <strong>Municipal Administrators</strong>
        </div>
      </section>

      {/* KPI Counters */}
      <section className="kpi-grid" style={{ marginBottom: '3.5rem' }}>
        <div className="kpi-card" style={{ textAlign: 'center' }}>
          <div className="kpi-icon" style={{ margin: '0 auto 0.5rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <Sparkles size={22} />
          </div>
          <div className="kpi-value" style={{ fontSize: '2rem' }}>96.5%</div>
          <div className="kpi-subtext" style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Auto-Classification Accuracy</div>
        </div>

        <div className="kpi-card" style={{ textAlign: 'center' }}>
          <div className="kpi-icon" style={{ margin: '0 auto 0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Clock size={22} />
          </div>
          <div className="kpi-value" style={{ fontSize: '2rem' }}>&lt; 24 Hrs</div>
          <div className="kpi-subtext" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Emergency Turnaround Target</div>
        </div>

        <div className="kpi-card" style={{ textAlign: 'center' }}>
          <div className="kpi-icon" style={{ margin: '0 auto 0.5rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Building size={22} />
          </div>
          <div className="kpi-value" style={{ fontSize: '2rem' }}>5 Wards</div>
          <div className="kpi-subtext" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Connected Municipal Departments</div>
        </div>

        <div className="kpi-card" style={{ textAlign: 'center' }}>
          <div className="kpi-icon" style={{ margin: '0 auto 0.5rem', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-value" style={{ fontSize: '2rem' }}>100%</div>
          <div className="kpi-subtext" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Photographic Evidence Audit Trail</div>
        </div>
      </section>

      {/* How the System Works */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            How the System Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            A transparent 4-step governance cycle connecting residents with city engineers.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          <div className="kpi-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'rgba(255,255,255,0.04)',
              lineHeight: 1
            }}>01</div>
            <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', marginBottom: '1rem' }}>
              <Camera size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Citizen Reporting</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Citizens upload a photo of road potholes, water leakages, or broken streetlights with GPS pin-point coordinates.
            </p>
          </div>

          <div className="kpi-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'rgba(255,255,255,0.04)',
              lineHeight: 1
            }}>02</div>
            <div className="kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', marginBottom: '1rem' }}>
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. AI Analysis & Triage</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Gemini Vision & Reasoning model evaluates severity, checks for duplicates, and assigns the correct priority and department.
            </p>
          </div>

          <div className="kpi-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'rgba(255,255,255,0.04)',
              lineHeight: 1
            }}>03</div>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', marginBottom: '1rem' }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Field Officer Dispatch</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Municipal engineers receive the digitized work order, navigate to the site via GPS, and carry out physical repairs.
            </p>
          </div>

          <div className="kpi-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'rgba(255,255,255,0.04)',
              lineHeight: 1
            }}>04</div>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', marginBottom: '1rem' }}>
              <CheckCircle2 size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>4. Proof & Feedback</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Officer uploads "After" repair photo proof. The complaint is resolved, and the citizen provides star ratings and reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Municipal Departments Connected */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Municipal Departments Integrated
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Each department operates with designated specialized response teams.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <MapPin size={22} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>Roads & Asphalt</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Potholes, pavers, dividers & sidewalk restoration</p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <Droplets size={22} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>Water & Sewerage</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Pipeline bursts, low pressure & drinking lines</p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <Zap size={22} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>Street Lighting</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>LED streetlamps, electrical transformers & wiring</p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <Trash2 size={22} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>Sanitation & Waste</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Garbage overflow, street sweeping & dump clearing</p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <Waves size={22} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>Stormwater Drains</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Open manholes, drain desilting & flood relief</p>
          </div>
        </div>
      </section>

      {/* Ready to Demo / Get Started CTA Card */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.6rem' }}>
          Access Your Civic Portal
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 1.8rem', fontSize: '0.95rem' }}>
          Sign in using verified credentials to access the <strong>Citizen Dashboard</strong>, <strong>Field Officer Work Orders</strong>, or the <strong>Municipal Administrator Command Center</strong>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => onOpenAuth('login')}
            style={{ padding: '0.75rem 1.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogIn size={18} />
            Sign In with Credentials
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onOpenAuth('register')}
            style={{ padding: '0.75rem 1.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <UserPlus size={18} />
            Register New Citizen
          </button>
        </div>
      </section>
    </div>
  );
}
