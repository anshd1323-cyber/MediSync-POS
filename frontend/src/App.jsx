import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { authAPI } from './api';
import { Login, Register } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { ConsultationsList } from './pages/ConsultationsList';
import { ConsultationRoom } from './pages/ConsultationRoom';
import { SettingsPage } from './pages/Settings';
import { POSTerminal } from './pages/POSTerminal';
import { Discovery } from './pages/Discovery';
import { 
  Activity, 
  Shield, 
  MessageSquare, 
  Calendar, 
  ArrowRight, 
  LayoutDashboard,
  CreditCard,
  MapPin, 
  Settings as SettingsIcon, 
  LogOut, 
  Lock, 
  Check, 
  Video, 
  Heart, 
  FileText, 
  Database,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  HelpCircle
} from 'lucide-react';

function Layout({ children, user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  useEffect(() => {
    if (!user && !isAuthPage) {
      navigate('/');
    }
  }, [user, isAuthPage, navigate]);

  if (isAuthPage) return children;
  
  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div className="sidebar-logo">
            +
          </div>
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">MediSync</span>
            <span className="sidebar-brand-sub">Clinical Workspace</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Clinical</div>
          <div className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
            <LayoutDashboard className="sidebar-link-icon" size={18} />
            <span>Dashboard</span>
          </div>
          {user?.role === 'PATIENT' && (
            <div className={`sidebar-link ${location.pathname === '/discovery' ? 'active' : ''}`} onClick={() => navigate('/discovery')}>
              <MapPin className="sidebar-link-icon" size={18} />
              <span>Find Clinics</span>
            </div>
          )}
          <div className={`sidebar-link ${location.pathname === '/consultations' ? 'active' : ''}`} onClick={() => navigate('/consultations')}>
            <MessageSquare className="sidebar-link-icon" size={18} />
            <span>Consultations</span>
          </div>
          <div className={`sidebar-link ${location.pathname === '/appointments' ? 'active' : ''}`} onClick={() => navigate('/appointments')}>
            <Calendar className="sidebar-link-icon" size={18} />
            <span>Appointments</span>
          </div>
          {user?.role === 'DOCTOR' && (
            <div className={`sidebar-link ${location.pathname === '/pos' ? 'active' : ''}`} onClick={() => navigate('/pos')}>
              <CreditCard className="sidebar-link-icon" size={18} />
              <span>POS Terminal</span>
            </div>
          )}
          
          <div className="sidebar-section-title" style={{ marginTop: '16px' }}>Account</div>
          <div className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`} onClick={() => navigate('/settings')}>
            <SettingsIcon className="sidebar-link-icon" size={18} />
            <span>Settings</span>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-role">{user?.role}</p>
            </div>
          </div>
          <button className="sidebar-logout-btn" style={{ width: '100%', marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }} onClick={() => {
            localStorage.removeItem('token');
            setUser(null);
            navigate('/');
          }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <span className="topbar-breadcrumb">MediSync Portal &gt; Dashboard</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}

function Appointments() {
  return (
    <div className="card">
      <div className="card-body">
        <h2>Appointments</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>Your upcoming scheduled appointments will appear here.</p>
      </div>
    </div>
  );
}



function Landing() {
  const navigate = useNavigate();
  return (
    <div className="landing-page" style={{ background: 'var(--color-bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Navigation */}
      <header className="landing-nav" style={{ padding: '24px 32px', background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            backgroundColor: 'var(--color-primary)', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontWeight: 'bold',
            fontSize: '20px'
          }}>
            +
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>MediSync</span>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="btn btn-ghost" style={{ fontWeight: 600 }} onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 600 }} onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero" style={{ padding: '80px 24px 48px 24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          borderRadius: '100px',
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '28px',
          boxShadow: '0 2px 10px rgba(13, 148, 136, 0.08)'
        }}>
          <Shield size={14} />
          <span>HIPAA & SOC2 Compliant Secure Sandbox</span>
        </div>
        
        <h1 style={{ fontSize: '3.6rem', lineHeight: '1.15', fontWeight: '800', letterSpacing: '-0.03em' }}>
          The Clinical Workspace <br />
          Built for Modern Practice.
        </h1>
        
        <p style={{ marginTop: '20px', fontSize: '18px', color: 'var(--color-text-secondary)', maxW: '640px', lineHeight: '1.7' }}>
          Secure, real-time consultation engine designed for clinics, independent practitioners, and patients. Streamline scheduling, SOAP note documentation, and telemedicine.
        </p>
        
        <div className="landing-cta-group" style={{ marginTop: '32px' }}>
          <button className="btn btn-primary landing-cta" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '10px' }} onClick={() => navigate('/register')}>
            <span>Register Workspace</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary landing-cta" style={{ padding: '14px 32px', borderRadius: '10px', background: 'var(--color-white)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} onClick={() => navigate('/login')}>
            Patient Sign In
          </button>
        </div>

        {/* Premium Clinical Workspace Dashboard Mockup */}
        <div style={{
          marginTop: '64px',
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-xl)',
          padding: '16px',
          maxW: '960px',
          margin: '64px auto 0 auto',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Mock Window Top Bar */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
            <div style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--color-text-muted)' }}>medisync-session-room.html</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px', textAlign: 'left' }}>
            <div style={{ background: 'var(--color-bg)', borderRadius: '10px', padding: '16px', border: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
                <strong style={{ fontSize: '12px' }}>Live Consultation Session</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ alignSelf: 'flex-start', background: 'var(--color-white)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                  <strong>Dr. Meredith Grey:</strong> I have reviewed your objective vitals. We will start your treatment course today.
                </div>
                <div style={{ alignSelf: 'flex-end', background: 'var(--color-primary)', color: 'white', padding: '8px 12px', borderRadius: '8px' }}>
                  <strong>Patient:</strong> Thank you Doctor. I will download the prescription PDF.
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border-light)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Patient Vitals</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>72 bpm</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-success)' }}>● Normal</div>
                </div>
              </div>
              <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border-light)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Prescribed Treatment Plan</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: 500 }}>Amoxicillin 500mg - Twice daily</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Banner */}
      <section style={{ background: 'var(--color-white)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '32px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '24px', maxW: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary)' }}>99.99%</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>Telehealth Connection Uptime</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary)' }}>250K+</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>Completed Consultations</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary)' }}>&lt; 2 min</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>Avg Patient Queue Wait Time</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary)' }}>AES-256</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>Data Encryption Standard</div>
          </div>
        </div>
      </section>

      {/* Clinical Workflow Section */}
      <section className="landing-section" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 className="landing-section-title">Seamless Patient-Provider Coordination</h2>
        <p className="landing-section-subtitle" style={{ maxW: '600px', margin: '0 auto 48px auto' }}>
          How MediSync coordinates operations end-to-end.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', maxW: '1100px', margin: '0 auto' }}>
          <div style={{ padding: '24px', background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'left', relative: 'true' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '16px' }}>1</div>
            <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>Define Shifts & Slots</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>Doctors configure shift dates, booking intervals, and break buffers to automate availability.</p>
          </div>
          <div style={{ padding: '24px', background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'left' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '16px' }}>2</div>
            <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>Calendar Slot Booking</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>Patients select a calendar date, review available time slots in a grid, and instantly book appointments.</p>
          </div>
          <div style={{ padding: '24px', background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'left' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '16px' }}>3</div>
            <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>Consultation & Call</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>Live chat channels open with integrated telehealth audio/video streams for diagnostics.</p>
          </div>
          <div style={{ padding: '24px', background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'left' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '16px' }}>4</div>
            <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>SOAP & Prescription</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>Doctors log SOAP notes and dispatch prescriptions. Details are safely archived as health files.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-section" style={{ padding: '80px 24px', borderTop: '1px solid var(--color-border)' }}>
        <h2 className="landing-section-title">Everything you need in one clinical portal</h2>
        <p className="landing-section-subtitle" style={{ maxW: '600px', margin: '0 auto 64px auto' }}>
          Engineered to comply with data privacy policies while delivering exceptional speed and user convenience.
        </p>
        
        <div className="landing-features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Activity size={24} />
            </div>
            <h3>Structured Consultation Engine</h3>
            <p>Track history, session statuses, and active patient queues in a beautifully structured data table workspace.</p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <Video size={24} />
            </div>
            <h3>Audio & Video Telehealth</h3>
            <p>One-click secure consultation calling. Connect with patients in an instant virtual clinic room directly in-browser.</p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
              <FileText size={24} />
            </div>
            <h3>Structured SOAP Notes</h3>
            <p>Complete Subjective, Objective, Assessment, and Plan templates. Issue prescriptions directly to patient chat threads.</p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
              <Calendar size={24} />
            </div>
            <h3>Timezone-Safe Slot Booking</h3>
            <p>Patients pick shift days and times from a calendar. Breaks and buffer durations are computed dynamically on the backend.</p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <MessageSquare size={24} />
            </div>
            <h3>Real-Time Live Chat</h3>
            <p>Socket-powered instant messages. Communicate symptoms, attach treatment advice, and send immediate feedback.</p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
              <Database size={24} />
            </div>
            <h3>Database & ORM Layer</h3>
            <p>SQLite and PostgreSQL integrations through Sequelize models. Clean transactions and secure password hashing via bcrypt.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="landing-section" style={{ padding: '80px 24px', borderTop: '1px solid var(--color-border)' }}>
        <h2 className="landing-section-title">Transparent pricing for any scale</h2>
        <p className="landing-section-subtitle" style={{ maxW: '600px', margin: '0 auto 64px auto' }}>
          No hidden fees. Full database sandbox environment accessible immediately.
        </p>

        <div className="pricing-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          <div className="pricing-card">
            <div className="pricing-name">Developer Sandbox</div>
            <div className="pricing-price">$0<span>/mo</span></div>
            <div className="pricing-desc">Perfect for testing the workspace environment locally.</div>
            <ul className="pricing-features">
              <li><Check size={14} /> <span>1 Active Doctor Profile</span></li>
              <li><Check size={14} /> <span>SQLite Database Synced</span></li>
              <li><Check size={14} /> <span>Basic Live Chat Messages</span></li>
              <li><Check size={14} /> <span>Manual Slot Selection</span></li>
            </ul>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/register')}>Launch Free</button>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-name">Professional Clinic</div>
            <div className="pricing-price">$29<span>/mo</span></div>
            <div className="pricing-desc">Built for independent clinics and practitioners.</div>
            <ul className="pricing-features">
              <li><Check size={14} /> <span>Unlimited Consultations</span></li>
              <li><Check size={14} /> <span>Dynamic Slot + Buffer Times</span></li>
              <li><Check size={14} /> <span>Full Audio/Video Telehealth</span></li>
              <li><Check size={14} /> <span>SOAP Note Draft Builder</span></li>
            </ul>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/register')}>Start Trial</button>
          </div>

          <div className="pricing-card">
            <div className="pricing-name">Medical Group</div>
            <div className="pricing-price">$79<span>/mo</span></div>
            <div className="pricing-desc">Designed for group clinics with multiple practitioners.</div>
            <ul className="pricing-features">
              <li><Check size={14} /> <span>Up to 10 Doctor Staff</span></li>
              <li><Check size={14} /> <span>PostgreSQL Database Core</span></li>
              <li><Check size={14} /> <span>Prescription PDF Downloads</span></li>
              <li><Check size={14} /> <span>Priority Dedicated Socket</span></li>
            </ul>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/register')}>Upgrade Now</button>
          </div>

          <div className="pricing-card">
            <div className="pricing-name">Hospital Enterprise</div>
            <div className="pricing-price">$199<span>/mo</span></div>
            <div className="pricing-desc">For large healthcare organizations requiring custom logic.</div>
            <ul className="pricing-features">
              <li><Check size={14} /> <span>Unlimited Medical Staff</span></li>
              <li><Check size={14} /> <span>Dedicated AWS RDS Setup</span></li>
              <li><Check size={14} /> <span>HIPAA Audit Log Access</span></li>
              <li><Check size={14} /> <span>24/7 Priority SLA Support</span></li>
            </ul>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/register')}>Contact Sales</button>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="landing-section" style={{ padding: '80px 24px', borderTop: '1px solid var(--color-border)' }}>
        <h2 className="landing-section-title">Frequently Asked Questions</h2>
        <p className="landing-section-subtitle" style={{ maxW: '600px', margin: '0 auto 48px auto' }}>
          Got questions? We have answers.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', maxW: '960px', margin: '0 auto', textAlign: 'left' }}>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text)', marginBottom: '8px' }}>Is the video consultation HIPAA compliant?</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              Yes. All live socket messages, media tracks, and SOAP notes are transmitted over encrypted TLS channels and stored with localized schema access control.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text)', marginBottom: '8px' }}>How do doctors set their custom booking schedules?</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              Doctors can access the workspace availability panel, pick active week shift days, set starting and ending times, and configure slots and buffer times.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text)', marginBottom: '8px' }}>Can we switch between SQLite and PostgreSQL?</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              Absolutely. Our backend uses Sequelize ORM. Simply supply your `DATABASE_URL` in the `.env` variables to transition databases seamlessly without altering query codes.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text)', marginBottom: '8px' }}>How does the dynamic buffer time algorithm operate?</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              The backend generated slots split shifts into active consultation increments (e.g. 30 mins) and insert a break buffer (e.g. 10 mins) before computing the subsequent start time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" style={{ padding: '64px 32px', background: 'var(--color-text)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', maxW: '1280px', margin: '0 auto', textAlign: 'left', marginBottom: '48px' }}>
          <div>
            <h4 style={{ color: 'var(--color-white)', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>MediSync</h4>
            <p style={{ fontSize: '12px', lineHeight: '1.6' }}>Providing medical practitioners with secure clinical workspaces to manage consultations and prescriptions.</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--color-white)', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <li>Consultations</li>
              <li>Scheduler</li>
              <li>Prescriptions</li>
              <li>Security</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--color-white)', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Database</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <li>Sequelize Schema</li>
              <li>SQLite Core</li>
              <li>PostgreSQL migration</li>
              <li>Seed scripts</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--color-white)', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Compliance</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <li>HIPAA Rules</li>
              <li>SOC2 Audit</li>
              <li>Encrypted Vitals</li>
              <li>Audit Trails</li>
            </ul>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>© {new Date().getFullYear()} MediSync Clinical Technologies Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await authAPI.getProfile();
          setUser(data.data);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>Loading application...</div>;

  return (
    <Router>
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/consultations" element={<ConsultationsList user={user} />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/settings" element={<SettingsPage user={user} onUpdateUser={setUser} />} />
          <Route path="/discovery" element={<Discovery user={user} />} />
          <Route path="/pos" element={<POSTerminal user={user} />} />
          <Route path="/consultation/:id" element={<ConsultationRoom user={user} />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
