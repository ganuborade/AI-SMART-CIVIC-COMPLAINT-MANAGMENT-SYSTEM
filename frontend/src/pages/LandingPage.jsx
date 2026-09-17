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
  Users,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Info,
  ExternalLink,
  AlertTriangle,
  Heart,
  Database,
  Cpu,
  Key,
  Smartphone,
  CheckCircle,
  FileText,
  Lock,
  Layers
} from 'lucide-react';
import { getComplaintsApi } from '../api';

export default function LandingPage({ onOpenAuth, onSelectComplaint }) {
  const [publicComplaints, setPublicComplaints] = useState([]);
  const [activeManualTab, setActiveManualTab] = useState('citizen'); // 'citizen' | 'employee' | 'admin'
  const [expandedFaq, setExpandedFaq] = useState(0); // Index of open FAQ accordion

  const feedbackUrl = "https://docs.google.com/forms/d/e/1FAIpQLSddEUsGIPqOsh6uXN01mszEO12jZRgRjV_f6b4b1P07AVM16w/viewform?usp=header";

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

  const faqs = [
    {
      q: "How does the AI automated priority and department assignment work?",
      a: "When a citizen submits a complaint (e.g., 'Severe water pipe leakage flooding main road near Shaniwar Wada'), the backend AI triage engine analyzes the description keywords, urgency indicators, and infrastructural context. It automatically maps the issue to the appropriate department (e.g. Water & Sewerage) and assigns an SLA priority (Critical, High, Medium, Low) within milliseconds."
    },
    {
      q: "How does the real-time GPS location capture work without paid API keys?",
      a: "The portal utilizes the device's native HTML5 Geolocation API with high-accuracy mode (±5 to 15 meters). To resolve coordinates into a human-readable street address without paid Google Maps billing, the system queries the free OpenStreetMap Nominatim reverse geocoding engine in real-time."
    },
    {
      q: "What security authorization is required for Admin and Municipal Officer registration?",
      a: "To prevent unauthorized accounts from gaining administrative or field privileges, strict cryptographic authorization passkeys are enforced. Municipal Staff and System Administrators must enter their official confidential authorization keys assigned by Municipal IT Administration. Citizens can register freely without any passkey."
    },
    {
      q: "How do field officers verify that a complaint is actually resolved?",
      a: "Officers visit the physical site, perform repair work, and are required to upload high-resolution photographic evidence of the resolved site directly from their dashboard before marking the ticket as 'RESOLVED'. Citizens can inspect before-and-after photo evidence and submit 1 to 5 star satisfaction reviews."
    },
    {
      q: "Which languages and themes are available on this platform?",
      a: "CivicAI Pulse is fully trilingual, supporting English, हिंदी (Hindi), and मराठी (Marathi) with instantaneous switching via the top navigation bar. It also includes an ambient Theme Switcher offering Dark Mode for night field work and High-Contrast Light Mode for daytime municipal desk work."
    },
    {
      q: "What should citizens do in case of an immediate life-threatening emergency?",
      a: "This system is dedicated to municipal civil infrastructure grievances. For immediate life-threatening emergencies, armed crimes, accidents, or fires, citizens should immediately dial national emergency helplines: 112 (National Emergency), 100 (Police), 101 (Fire Brigade), or 108 (Ambulance)."
    }
  ];

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
          color: 'var(--text-primary)'
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
          Empowering citizens to report urban infrastructural issues with photo evidence and live GPS coordinates.
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
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '0.85rem 1.4rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', textDecoration: 'none' }}
          >
            <Star size={18} />
            Submit Feedback Form
          </a>
        </div>

        {/* Access info */}
        <div style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          🔒 Role-Based Authorization: Confidential Verification Required for Municipal Staff and Administrators
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            How CivicAI Pulse Transforms City Governance
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
            A unified, transparent platform connecting citizens directly with field engineers and municipal leaders.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Camera size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Photo Evidence Verification</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Upload before-and-after photo proof. Every complaint requires verifiable photo documentation to ensure accountability.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <MapPin size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Real-time GPS Spatial Telemetry</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Pinpoint accuracy via HTML5 geolocation and free OpenStreetMap Nominatim reverse geocoding with interactive map rendering.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Triage &amp; Auto-Dispatch</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Natural language damage assessment automatically predicts categories, assigns priorities, and notifies departments within seconds.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Closed-Loop SLA Tracking</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Field engineers provide timestamped completion photos. Citizens review resolutions and score departmental performance.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: About This Project Architecture */}
      <section id="about-section" style={{ marginBottom: '4rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Info size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>About CivicAI Pulse Project</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                System Architecture, Core Technologies, and Engineering Philosophy
              </p>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
            CivicAI Pulse is an enterprise-grade civic grievance management ecosystem developed by <strong>TeamGanesh</strong>.
            The system bridges the critical communication gap between urban citizens and municipal administrative bodies through
            state-of-the-art web technologies, high-performance database pooling, and intelligent spatial telemetry.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                <Database size={18} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>MySQL 8 &amp; HikariCP Pooling</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Configured with HikariCP connection pooling (max pool size: 20, minimum idle: 5, statement caching of 250 statements)
                and batched statement rewriting for sub-millisecond query execution.
              </p>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#38bdf8' }}>
                <MapPin size={18} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>OpenStreetMap &amp; Free Nominatim</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Eliminates expensive proprietary map API billing. Captures hardware GPS coordinates (latitude, longitude, accuracy)
                and resolves exact street addresses via OpenStreetMap API.
              </p>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#f59e0b' }}>
                <Key size={18} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Cryptographic Passkeys &amp; RBAC</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Strict role-based access control protecting Citizen, Municipal Officer, and Administrator domains with BCrypt password hashing,
                JWT authentication, and protected registration passkeys.
              </p>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#10b981' }}>
                <Smartphone size={18} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Trilingual UI &amp; Dual Themes</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Built for true grassroots accessibility supporting English, Hindi (हिंदी), and Marathi (मराठी) alongside
                instant Light and Dark mode toggling for varying daylight and field conditions.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* SECTION: Interactive FAQ Accordion */}
      <section id="faq-section" style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '0.8rem'
          }}>
            <HelpCircle size={14} /> Knowledge Base &amp; Redressal Details
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Frequently Asked Questions (FAQ)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
            Quick answers about system functionality, SLA resolution timelines, and privacy policies.
          </p>
        </div>

        <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Q{idx + 1}.</span>
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 1.25rem 1.2rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.65,
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    paddingTop: '0.9rem'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: Citizen Feedback Google Form Action Card */}
      <section id="feedback-section" style={{ marginBottom: '4rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Star size={24} fill="#f59e0b" />
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            Share Your Experience — Citizen Feedback Survey
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto 1.8rem', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Help our municipal engineering team improve public service quality. Please take 2 minutes to complete our official survey.
            Your feedback directly guides civic software enhancements and officer training.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href={feedbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                padding: '0.85rem 1.8rem',
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={18} /> Open Citizen Feedback Google Form
            </a>
            <button
              className="btn btn-secondary"
              onClick={() => onOpenAuth('register')}
              style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <UserPlus size={18} /> Register as Citizen
            </button>
          </div>
        </div>
      </section>

      {/* Ready to Demo / Get Started CTA Card */}
      <section style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.6rem' }}>
          Access Your Civic Portal Now
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
            Register New Account
          </button>
        </div>
      </section>
    </div>
  );
}
