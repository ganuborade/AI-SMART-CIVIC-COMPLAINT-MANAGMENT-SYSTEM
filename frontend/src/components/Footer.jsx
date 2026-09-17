import React from 'react';
import {
  Shield,
  Heart,
  Mail,
  Phone,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  BookOpen,
  AlertTriangle,
  Database,
  MapPin,
  Cpu,
  CheckCircle
} from 'lucide-react';
import { useUI } from '../context/UIContext';

export default function Footer({ onOpenManual, onOpenFaq }) {
  const { t } = useUI();
  const feedbackUrl = "https://docs.google.com/forms/d/e/1FAIpQLSddEUsGIPqOsh6uXN01mszEO12jZRgRjV_f6b4b1P07AVM16w/viewform?usp=header";

  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto',
      padding: '3rem 1.5rem 2rem',
      color: 'var(--text-secondary)',
      fontSize: '0.85rem'
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Shield size={18} />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                CivicAI <span style={{ color: 'var(--primary)' }}>Pulse</span>
              </span>
            </div>

            <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '1.2rem', fontSize: '0.82rem' }}>
              Next-generation municipal grievance redressal system powered by real-time GPS spatial telemetry,
              multimodal damage triage, and automated departmental dispatch with SLA tracking.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: '#818cf8',
              fontSize: '0.78rem',
              fontWeight: 600
            }}>
              <Heart size={14} color="#f43f5e" fill="#f43f5e" />
              Developed with love by <strong>TeamGanesh</strong>
            </div>
          </div>

          {/* Quick Links & User Guides */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} color="var(--primary)" /> Documentation &amp; Guides
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>
                <a
                  href="#user-manual"
                  onClick={(e) => {
                    const el = document.getElementById('user-manual');
                    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
                    if (onOpenManual) onOpenManual('citizen');
                  }}
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  📖 Citizen User Manual
                </a>
              </li>
              <li>
                <a
                  href="#user-manual"
                  onClick={(e) => {
                    const el = document.getElementById('user-manual');
                    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
                    if (onOpenManual) onOpenManual('employee');
                  }}
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  👷 Field Officer Resolution Guide
                </a>
              </li>
              <li>
                <a
                  href="#user-manual"
                  onClick={(e) => {
                    const el = document.getElementById('user-manual');
                    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
                    if (onOpenManual) onOpenManual('admin');
                  }}
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  🏛️ Administrator Command Guide
                </a>
              </li>
              <li>
                <a
                  href="#faq-section"
                  onClick={(e) => {
                    const el = document.getElementById('faq-section');
                    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
                    if (onOpenFaq) onOpenFaq();
                  }}
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  <HelpCircle size={14} /> Frequently Asked Questions (FAQ)
                </a>
              </li>
              <li>
                <a
                  href="#about-section"
                  onClick={(e) => {
                    const el = document.getElementById('about-section');
                    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
                  }}
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  ⚡ About This Project Architecture
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & TeamGanesh */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} color="var(--primary)" /> Team &amp; Direct Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Mail size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Official Email</div>
                  <a
                    href="mailto:ganuborade9898@gmail.com"
                    style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    ganuborade9898@gmail.com
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                  <Phone size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mobile / WhatsApp Support</div>
                  <a
                    href="tel:9096040485"
                    style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    +91 9096040485
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                  <MapPin size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Jurisdiction Headquarters</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Ameerpet Circle, Greater Hyderabad Municipal Corporation (GHMC), Telangana</div>
                </div>
              </div>
            </div>
          </div>

          {/* Citizen Feedback Google Form */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} color="var(--primary)" /> Citizen Feedback Survey
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Your feedback shapes smart city governance. Please share your reviews, service ratings, and suggestions via our official Google Form.
            </p>
            <a
              href={feedbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1.1rem',
                fontSize: '0.85rem',
                textDecoration: 'none',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <ExternalLink size={15} /> Open Feedback Google Form
            </a>
          </div>
        </div>

        {/* Disclaimer Card */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.78rem', lineHeight: 1.55 }}>
            <strong style={{ color: '#f87171' }}>CIVIC SERVICE DISCLAIMER &amp; EMERGENCY NOTICE:</strong>
            <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
              This platform is designed specifically for public civic infrastructure grievances (potholes, water pipeline leakages, street lighting failures, garbage dumps, and open stormwater drains).
              For urgent life-threatening emergencies, police assistance, ambulance support, or active fires, please immediately call national emergency helplines:
              <strong style={{ color: '#fff' }}> 112 (National Emergency)</strong>,
              <strong style={{ color: '#fff' }}> 100 (Police)</strong>,
              <strong style={{ color: '#fff' }}> 101 (Fire Brigade)</strong>, or
              <strong style={{ color: '#fff' }}> 108 (Ambulance)</strong>.
              All reported complaints are tracked in accordance with municipal SLAs and data protection guidelines.
            </span>
          </div>
        </div>

        {/* Bottom Bar & Tech Specs */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} CivicAI Pulse. Developed with ❤️ by <strong>TeamGanesh</strong>. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Database size={13} color="var(--success)" /> MySQL 8.0 HikariCP
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="#38bdf8" /> OpenStreetMap Real-Time GPS
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Cpu size={13} color="#c084fc" /> Multimodal AI Triage
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
