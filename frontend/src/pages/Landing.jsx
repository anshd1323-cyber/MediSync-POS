import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, CheckCircle, Database, Check, Activity, Zap, Users, FileText } from 'lucide-react';
import { RaceSimulator } from '../components/RaceSimulator';
import { AuditLogTerminal } from '../components/AuditLogTerminal';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page" style={{ background: 'var(--color-bg)', minHeight: '100vh', overflowX: 'hidden', color: 'var(--color-text)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        .hero-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140%;
          height: 140%;
          background: radial-gradient(circle, var(--color-primary-light) 0%, transparent 60%);
          z-index: 0;
          opacity: 0.6;
        }
        .feature-img-container {
          position: relative;
          z-index: 1;
          background: var(--color-white);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          transition: transform var(--transition-slow), box-shadow var(--transition-slow);
        }
        .feature-img-container:hover {
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.2);
        }
        .hover-card {
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .hover-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
      `}</style>

      {/* Navigation */}
      <header className="landing-nav" style={{ padding: '24px 48px', background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: 'var(--color-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
            +
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>MediSync</span>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="btn btn-ghost" style={{ fontWeight: 600, fontSize: '15px' }} onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 600, borderRadius: '8px', fontSize: '15px' }} onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>View POS Plans</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero" style={{ padding: '120px 48px 80px 48px', maxWidth: '1400px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div className="hero-glow"></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'var(--color-white)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', borderRadius: '100px', fontSize: '14px', fontWeight: '600', marginBottom: '32px', boxShadow: 'var(--shadow-sm)' }}>
            <Zap size={16} fill="currentColor" />
            <span>Enterprise-Grade POS & Telehealth Architecture</span>
          </div>

          <h1 style={{ fontSize: '5.5rem', lineHeight: '1.05', fontWeight: '800', letterSpacing: '-0.04em', color: 'var(--color-text)', marginBottom: '32px' }}>
            Healthcare infrastructure,<br />built for operational reality.
          </h1>
          
          <p style={{ margin: '0 auto 48px auto', fontSize: '22px', color: 'var(--color-text-secondary)', maxWidth: '800px', lineHeight: '1.6', fontWeight: '400' }}>
            Equip your medical practice with multi-tenant clinic management, telehealth featuring structured SOAP notes, and a deeply integrated pharmacy POS with strict controlled-substance compliance gating.
          </p>
          
          <div className="landing-cta-group" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '100px' }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 36px', borderRadius: '8px', fontWeight: '600', fontSize: '18px' }} onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>
              <span>Select POS Subscription</span>
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Real Product Screenshot */}
          <div className="feature-img-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <img src="/images/hero_dashboard_pos.jpg" alt="MediSync POS and Dashboard Interface" style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }} />
          </div>
        </div>
      </section>

      {/* Detailed Trust & Architecture Signals */}
      <section style={{ background: 'var(--color-white)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '80px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '16px' }}>Compliance-first infrastructure</h2>
          <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto' }}>We handle the regulatory complexity at the database layer so you can focus on patient outcomes.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', maxWidth: '1400px', margin: '0 auto' }}>
          <div className="hover-card" style={{ padding: '32px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--color-primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Database size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--color-text)' }}>Multi-Tenant Isolation</h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>Strict clinic-level scoping enforces tenant isolation across all queries. Your patient data is cryptographically separated from other workspaces.</p>
          </div>
          
          <div className="hover-card" style={{ padding: '32px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--color-primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Lock size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--color-text)' }}>Role-Based Access Control</h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>Granular permissions ensure only authenticated doctors can issue prescriptions, while cashiers handle billing safely.</p>
          </div>
          
          <div className="hover-card" style={{ padding: '32px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--color-primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Shield size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--color-text)' }}>Immutable Audit Trails</h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>Every attempt to dispense a Schedule H1 or X controlled substance is permanently logged to an immutable audit ledger.</p>
          </div>
          
          <div className="hover-card" style={{ padding: '32px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--color-primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <CheckCircle size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--color-text)' }}>Row-Level Transactions</h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>Strict PostgreSQL/SQLite transaction locking (t.LOCK.UPDATE) physically prevents double-bookings and stock overselling.</p>
          </div>
        </div>
      </section>

      {/* Feature Pillar 1: Discovery & Booking */}
      <section style={{ padding: '140px 48px', maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '80px' }}>
        <div style={{ flex: '1 1 40%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '6px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
            <Users size={14} /> 01 / Patient Acquisition
          </div>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text)', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Geolocation Search &<br />Race-Safe Booking
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '40px' }}>
            Patients can discover clinics based on proximity and real-time availability. Our backend computes dynamic slot times taking into account shift configurations and buffers. 
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '50%', padding: '4px', marginTop: '2px' }}><Check size={16} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: 'var(--color-text)', marginBottom: '4px' }}>Concurrency Safe</strong>
                <span style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>Row-level locks guarantee overlapping attempts are rejected.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '50%', padding: '4px', marginTop: '2px' }}><Check size={16} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: 'var(--color-text)', marginBottom: '4px' }}>Smart Break Buffers</strong>
                <span style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>System auto-injects cooldown times between appointments.</span>
              </div>
            </li>
          </ul>
        </div>
        <div style={{ flex: '1 1 60%' }}>
          <div className="feature-img-container">
            <img src="/images/booking_ui.jpg" alt="Patient Discovery and Booking UI" style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }} />
          </div>
          <RaceSimulator />
        </div>
      </section>

      {/* Feature Pillar 2: Telehealth & Clinical Workflow */}
      <section style={{ padding: '140px 48px', background: 'var(--color-white)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '80px', flexDirection: 'row-reverse' }}>
          <div style={{ flex: '1 1 40%' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '6px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
              <Activity size={14} /> 02 / Clinical Workflows
            </div>
            <h2 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text)', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.02em' }}>
              Telehealth Consults &<br />Structured SOAP Notes
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '40px' }}>
              Conduct secure live video consultations with integrated real-time chat. Document encounters using strict SOAP note formatting and convert them directly into immutable health records.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '50%', padding: '4px', marginTop: '2px' }}><Check size={16} /></div>
                <div>
                  <strong style={{ display: 'block', fontSize: '16px', color: 'var(--color-text)', marginBottom: '4px' }}>Real-time Vitals Sync</strong>
                  <span style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>Live websocket feeds update objective patient data instantly.</span>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '50%', padding: '4px', marginTop: '2px' }}><Check size={16} /></div>
                <div>
                  <strong style={{ display: 'block', fontSize: '16px', color: 'var(--color-text)', marginBottom: '4px' }}>Direct Prescribing</strong>
                  <span style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>Search your inventory and append prescriptions within the call.</span>
                </div>
              </li>
            </ul>
          </div>
          <div style={{ flex: '1 1 60%' }} className="feature-img-container">
            <img src="/images/telehealth_soap_ui.jpg" alt="Telehealth Video and SOAP Notes UI" style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }} />
          </div>
        </div>
      </section>

      {/* Feature Pillar 3: POS & Inventory */}
      <section style={{ padding: '140px 48px', maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '80px' }}>
        <div style={{ flex: '1 1 40%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '6px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
            <FileText size={14} /> 03 / Financial Operations
          </div>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text)', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Integrated Pharmacy POS &<br />Inventory Gating
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '40px' }}>
            Convert patient prescriptions directly into payable invoices. The checkout terminal manages real-time stock deduction with deep validation logic.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)', borderRadius: '50%', padding: '4px', marginTop: '2px' }}><Check size={16} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: 'var(--color-text)', marginBottom: '4px' }}>Controlled-Substance Blocks</strong>
                <span style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>H1/X schedule drugs strictly require linked valid prescriptions.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '50%', padding: '4px', marginTop: '2px' }}><Check size={16} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: 'var(--color-text)', marginBottom: '4px' }}>Atomic Stock Updates</strong>
                <span style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>Inventory is decreased within the same locking transaction as billing.</span>
              </div>
            </li>
          </ul>
        </div>
        <div style={{ flex: '1 1 60%' }}>
          <div className="feature-img-container">
            <img src="/images/pharmacy_pos_ui.jpg" alt="Pharmacy POS and Inventory Management UI" style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }} />
          </div>
          <AuditLogTerminal />
        </div>
      </section>

      {/* Pricing Section - Step 1 of Sign Up */}
      <section id="pricing" className="landing-section" style={{ padding: '120px 48px', background: 'var(--color-white)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '16px' }}>Select your POS Subscription</h2>
          <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 80px auto', color: 'var(--color-text-secondary)' }}>
            Choose a plan to create your clinic workspace. All plans include full POS integration and controlled-substance gating.
          </p>
        </div>

        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="hover-card" style={{ background: 'var(--color-bg)', padding: '40px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontWeight: '700', color: 'var(--color-primary)', marginBottom: '12px', fontSize: '18px' }}>Developer Sandbox</div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '16px' }}>$0<span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>/mo</span></div>
            <div style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '32px', minHeight: '48px', lineHeight: '1.5' }}>Perfect for testing the workspace environment locally.</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px', color: 'var(--color-text)' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span>1 Active Doctor Profile</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span>SQLite Database Synced</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span>Basic Live Chat Messages</span></li>
            </ul>
            <button className="btn btn-outline" style={{ width: '100%', padding: '14px', fontSize: '16px', borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-white)', borderRadius: '8px' }} onClick={() => navigate('/onboarding?plan=professional')}>Select Plan &amp; Register</button>
          </div>

          <div className="hover-card" style={{ background: 'var(--color-primary-light)', padding: '40px', borderRadius: '16px', border: `2px solid var(--color-primary)`, position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Most Popular</div>
            <div style={{ fontWeight: '700', color: 'var(--color-primary)', marginBottom: '12px', fontSize: '18px' }}>Professional Clinic</div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '16px' }}>$29<span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>/mo</span></div>
            <div style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '32px', minHeight: '48px', lineHeight: '1.5' }}>Built for independent clinics and practitioners.</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px', color: 'var(--color-text)' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span>Unlimited Consultations</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span>Full Pharmacy POS Sync</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span>Dynamic Booking Engine</span></li>
            </ul>
            <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px' }} onClick={() => navigate('/onboarding?plan=professional')}>Select Plan &amp; Register</button>
          </div>

          <div className="hover-card" style={{ background: 'var(--color-bg)', padding: '40px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontWeight: '700', color: 'var(--color-primary)', marginBottom: '12px', fontSize: '18px' }}>Medical Group</div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '16px' }}>$79<span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>/mo</span></div>
            <div style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '32px', minHeight: '48px', lineHeight: '1.5' }}>Designed for group clinics with multiple practitioners.</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px', color: 'var(--color-text)' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span>Up to 10 Doctor Staff</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span>PostgreSQL Database Core</span></li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><Check size={20} color="var(--color-primary)" /> <span>Immutable Audit Exporting</span></li>
            </ul>
            <button className="btn btn-outline" style={{ width: '100%', padding: '14px', fontSize: '16px', borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-white)', borderRadius: '8px' }} onClick={() => navigate('/onboarding?plan=professional')}>Select Plan &amp; Register</button>
          </div>
        </div>
      </section>

      {/* Expanded FAQ Section */}
      <section style={{ padding: '120px 48px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '16px' }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Deep dive into our operational architecture and compliance standards.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '12px' }}>How does the POS enforce Schedule H1 restrictions?</h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
              The `Product` model utilizes a `scheduleClass` field. When checkout is initiated via `payInvoice`, the backend halts the transaction if the item is classified as H1 or X unless it is explicitly linked to a valid `prescriptionItemId` authored by an authorized doctor.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '12px' }}>Are telehealth sessions peer-to-peer or relayed?</h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Sessions leverage WebRTC for direct, encrypted P2P media streams. Websockets are used strictly as a signaling layer and for transmitting structured clinical vitals in real-time.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '12px' }}>How is stock overselling prevented?</h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Our ORM utilizes Sequelize's `transaction` wrapper alongside `t.LOCK.UPDATE`. This acquires a row-level lock on the specific `Product` record during checkout, ensuring consecutive requests queue sequentially at the database level.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '12px' }}>What happens if a transaction rolls back?</h4>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Due to atomic operations, if an invoice payment fails due to insufficient stock or failed H1 compliance, the entire transaction rolls back — meaning no false audit logs are created and no stock is erroneously deducted.
            </p>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer style={{ padding: '60px 48px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-secondary)', fontSize: '15px', background: 'var(--color-white)' }}>
        <div>© {new Date().getFullYear()} MediSync Clinical Technologies Inc. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '32px' }}>
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          <span style={{ cursor: 'pointer' }}>Security Architecture</span>
        </div>
      </footer>
    </div>
  );
}
